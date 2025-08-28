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

type WavBuffer = Uint8Array;
type Mp3Buffer = Uint8Array

export type AudioGenParams = {
    noticieroId: string,
}

export class AudioGenerationWorkflow extends WorkflowEntrypoint<Cloudflare.Env, AudioGenParams> {
    async run(event: WorkflowEvent<AudioGenParams>, step: WorkflowStep) {
        const noticeroRepository = new NoticierosD1Repository(this.env.DB)
        const audioRepository = new AudioR2Repository(this.env.NOTICIEROS_STORAGE)
        const latestNoticieroRepository = new LatestNoticieroKVRepository(this.env.LATEST_NOTICIERO_ST)
        console.info("Generando audio de noticiero aprobado: " + event.payload.noticieroId)
        const approvedNoticiero = await step.do("Obteniendo información del noticiero", async () => {
            return await noticeroRepository.findById(event.payload.noticieroId);
        })


        try {
            if (approvedNoticiero) {
                await step.do("Generando audio", async () => {
                    await this.pipelineAudio(approvedNoticiero, this.env.GEMINI_API_KEY, audioRepository)
                });

                await step.do("Actualizando Noticiero", async () => {
                    approvedNoticiero.state = NoticieroState.PUBLISHED;
                    approvedNoticiero.publicationDate = new Date();
                    await latestNoticieroRepository.insertLatest(approvedNoticiero)
                    await noticeroRepository.save(approvedNoticiero);
                })

                console.info("Noticiero más reciente actualizado")
            }
        } finally {
        }
    }

    /// Crea y almacena archivos de audio
    pipelineAudio = async (
        noticiero: Noticiero,
        apiKey: string,
        audioRepository: IAudioRepository
    ): Promise<void> => {
        console.info("Generando audio con Gemini");
        let wavBuffer = null;
        let mp3Buffer = null;
        let base64Data = null;
        try {
            const aiResponse = await this.generateAudioWithAI(
                audioNoticiero.instruction.join("\n"),
                noticiero.guion,
                apiKey
            )
            if (!aiResponse) {
                throw new Error("No se recibió información de audio desde Gemini TTS");
            }
            wavBuffer = this.transformBase64ToWAV(aiResponse);
            await audioRepository.uploadAudioWAV(noticiero.id, wavBuffer);
            console.info(("Audio WAV almacenado correctamente con id: " + noticiero.id));
            mp3Buffer = await this.transformWavToMp3(new Int16Array(wavBuffer.buffer));
            await audioRepository.uploadAudioMp3(noticiero.id, mp3Buffer);
            console.info(("Audio MP3 almacenado correctamente con id: " + noticiero.id));
            (aiResponse as any).dispose?.();
        }
        catch (e) {
            console.error("Error generando audio: " + e)
        } finally {
            if (wavBuffer) {
                wavBuffer.fill?.(0); // Limpiar contenido si es posible
                wavBuffer = null;
            }

            if (mp3Buffer) {
                mp3Buffer.fill?.(0); // Limpiar contenido si es posible  
                mp3Buffer = null;
            }

            if (base64Data) {
                base64Data = null;
            }


        }
    }

    generateAudioWithAI = async (instruction: string, content: string, apiKey: string): Promise<string> => {
        const gemini = new GoogleGenAI({ apiKey: apiKey })
        const response: GenerateContentResponse = await gemini.models.generateContent({
            model: "gemini-2.5-pro-preview-tts",
            contents: [{ parts: [{ text: instruction + "\n" + content, }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'FIN',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Charon' }
                                }
                            },
                            {
                                speaker: 'SUS',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Leda' }
                                }
                            }
                        ]
                    }
                }
            }
        })
        const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;

        // liberar stub
        (response as any).dispose?.();
        (gemini as any).dispose?.();

        return base64Data ?? "";
    }

    transformBase64ToWAV = (base64Data: string, channels = 1, rate = 24000, sampleWidth = 2): WavBuffer => {
        const pcmData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const dataLength = pcmData.length;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        // RIFF header
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true); // file length - 8
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // PCM chunk size
        view.setUint16(20, 1, true); // format = PCM
        view.setUint16(22, channels, true);
        view.setUint32(24, rate, true);
        view.setUint32(28, rate * channels * sampleWidth, true); // byte rate
        view.setUint16(32, channels * sampleWidth, true); // block align
        view.setUint16(34, sampleWidth * 8, true); // bits per sample
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // Copiar datos PCM después del header
        const wavBytes = new Uint8Array(buffer);
        wavBytes.set(pcmData, 44);

        return wavBytes;
    }

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
}