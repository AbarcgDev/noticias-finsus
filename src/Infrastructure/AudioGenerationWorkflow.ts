import { NoticieroState } from "@/Data/Models/NoticieroState";
import { IAudioRepository } from "@/Repositories/IAudioRepository";
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository";
import { INoticierosRepository } from "@/Repositories/INoticierosRepositrory";
import { WorkerEntrypoint, WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { AudioR2Repository } from "./NoticieroAudioR2Repository";
import { NoticierosD1Repository } from "./NoticierosD1Repository";
import { LatestNoticieroKVRepository } from "./LatestNoticieroKVRepository";
import { Noticiero } from "@/Data/Models/Noticiero";
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { audioNoticiero } from "../AIPrompts.json"
import * as lame from '@breezystack/lamejs';
import { GetKeyFunction } from "jose";
import { splitGuion } from "@/Data/Trasformations/SplitGuion";
import { v4 } from "uuid";

type WavBuffer = Uint8Array;
type Mp3Buffer = Uint8Array

export type AudioGenParams = {
    noticieroId: string,
}

export class AudioGenerationWorkflow extends WorkflowEntrypoint<Cloudflare.Env, AudioGenParams> {
    async run(event: WorkflowEvent<AudioGenParams>, step: WorkflowStep) {
        const parts: Map<string, string> = new Map();
        const noticeroRepository = new NoticierosD1Repository(this.env.DB)
        const audioRepository = new AudioR2Repository(this.env.NOTICIEROS_STORAGE)
        const latestNoticieroRepository = new LatestNoticieroKVRepository(this.env.LATEST_NOTICIERO_ST)
        console.info("Generando audio de noticiero aprobado: " + event.payload.noticieroId)
        const approvedNoticiero = await step.do("Obteniendo información del noticiero", async () => {
            return await noticeroRepository.findById(event.payload.noticieroId);
        })

        if (approvedNoticiero) {
            const partsStrings = splitGuion(approvedNoticiero.guion);
            partsStrings.forEach((part) => {
                parts.set(part, "");
            })
            const PCMs = await step.do("Generando audios PCM", async () => {
                try {
                    let idx = 1;
                    for (const [key, value] of parts) {
                        if (value !== "") {
                            console.info("Fragmento ya generado, omitiendo ----");
                            continue;
                        }
                        console.info("Generando audio de parte: " + idx++);
                        const base64 = await this.generateAudioWithAI(
                            audioNoticiero.instruction.join("/n"),
                            key,
                            this.env.GEMINI_API_KEY,
                        )
                        parts.set(key, base64);
                    }
                    return [...parts.values()];
                } catch (e: any) {
                    console.error(e);
                }
            });

            if (PCMs) {

                const bufferBase64 = await step.do("Creando Buffer", async () => {
                    const buffers = PCMs.map((pcm) => this.fbase64ToUint8Array(pcm))
                    const totalLength = buffers.reduce((acc, arr) => acc + arr.length, 0);
                    const result = new Uint8Array(totalLength);

                    let offset = 0;
                    for (const chunk of buffers) {
                        result.set(chunk, offset);
                        offset += chunk.length;
                    }

                    return result;
                });

                const audioWav = await step.do("Creando WAV", async () => {
                    return this.transformPCMToWAV(bufferBase64)
                })

                const audioMp3 = await step.do("Creando MP3", async () => {
                    return await this.transformWavToMp3(new Int16Array(audioWav.buffer));
                })

                await step.do("Almacenando WAV", async () => {
                    await audioRepository.uploadAudioWAV(approvedNoticiero.id, audioWav);
                    console.info(("Audio WAV almacenado correctamente con id: " + approvedNoticiero.id));
                })

                await step.do("Almacenando MP3", async () => {
                    await audioRepository.uploadAudioMp3(approvedNoticiero.id, audioMp3);
                    console.info(("Audio MP3 almacenado correctamente con id: " + approvedNoticiero.id));
                })

                await step.do("Actualizando Noticiero", async () => {
                    approvedNoticiero.state = NoticieroState.PUBLISHED;
                    approvedNoticiero.publicationDate = new Date();
                    await latestNoticieroRepository.insertLatest(approvedNoticiero)
                    await noticeroRepository.save(approvedNoticiero);
                })
            }
            console.info("Noticiero más reciente actualizado")
        }
    }

    wait = (ms: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    generateAudioWithAI = async (
        instruction: string,
        content: string,
        apiKey: string
    ): Promise<string> => {
        const maxRetries = 3;
        let retryCount = 0;
        let delay = 500; // 500 ms inicial

        while (true) {
            try {
                const gemini = new GoogleGenAI({ apiKey });
                const response = await gemini.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: `${instruction}\n${content}` }] }],
                    config: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            multiSpeakerVoiceConfig: {
                                speakerVoiceConfigs: [
                                    {
                                        speaker: "FINEAS",
                                        voiceConfig: {
                                            prebuiltVoiceConfig: { voiceName: "Charon" },
                                        },
                                    },
                                    {
                                        speaker: "SUSANA",
                                        voiceConfig: {
                                            prebuiltVoiceConfig: { voiceName: "Leda" },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                });

                const base64Data =
                    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? "";

                // Liberar recursos si existen
                (response as any).dispose?.();
                (gemini as any).dispose?.();

                return base64Data;
            } catch (e: any) {
                retryCount++;
                console.error(`Error al generar audio (intento ${retryCount}):`, e);

                if (retryCount >= maxRetries) {
                    throw new Error("No se pudo generar audio después de varios intentos");
                }

                console.log(`Reintentando en ${delay} ms...`);
                await this.wait(delay);
                delay *= 2; // Retardo exponencial en cada reintento
            }
        }
    }


    transformPCMToWAV = (
        pcmData: Uint8Array,
        channels = 1,
        rate = 24000,
        sampleWidth = 2
    ): Uint8Array => {
        const dataLength = pcmData.length;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        // RIFF header
        writeString(0, "RIFF");
        view.setUint32(4, 36 + dataLength, true); // file length - 8
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true); // PCM chunk size
        view.setUint16(20, 1, true); // format = PCM
        view.setUint16(22, channels, true);
        view.setUint32(24, rate, true);
        view.setUint32(28, rate * channels * sampleWidth, true); // byte rate
        view.setUint16(32, channels * sampleWidth, true); // block align
        view.setUint16(34, sampleWidth * 8, true); // bits per sample
        writeString(36, "data");
        view.setUint32(40, dataLength, true);

        // Copiar PCM después del header
        const wavBytes = new Uint8Array(buffer);
        wavBytes.set(pcmData, 44);

        return wavBytes;
    };


    transformWavToMp3 = async (wavBuffer16: Int16Array): Promise<Mp3Buffer> => {
        // Parámetros de codificación: 
        // 1. Número de canales (mono=1, estéreo=2)
        // 2. Tasa de muestreo (kHz)
        const mp3Encoder = new lame.Mp3Encoder(1, 24000, 128);

        // Asignar el buffer para la salida del MP3
        const mp3Data = [];

        // Codificar el buffer WAV en bloques
        const sampleBlockSize = 1152; // Un tamaño de bloque común para MP3
        for (let i = 0; i < wavBuffer16.length; i += sampleBlockSize) {
            const samples = wavBuffer16.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3Encoder.encodeBuffer(samples);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        // Finalizar la codificación para escribir los últimos bytes
        const finalMp3buf = mp3Encoder.flush();
        if (finalMp3buf.length > 0) {
            mp3Data.push(finalMp3buf);
        }

        // Concatenar todos los buffers del MP3 en uno solo
        const finalMp3Buffer = new Uint8Array(mp3Data.flatMap(arr => Array.from(arr)));
        return finalMp3Buffer
    };

    fbase64ToUint8Array = (base64: string): Uint8Array => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}