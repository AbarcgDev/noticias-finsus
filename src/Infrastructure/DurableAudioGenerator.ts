import { Noticiero } from "@/Data/Models/Noticiero";
import { GoogleGenAI } from "@google/genai";
import { DurableObject } from "cloudflare:workers";
import * as lame from '@breezystack/lamejs';
import { IAudioRepository } from "@/Repositories/IAudioRepository";
import { AudioR2Repository } from "./NoticieroAudioR2Repository";
import { Mp3Buffer } from "@/Data/Trasformations/TransformWAVToMP3";

interface HookData {
    jobId: string,
    success: boolean,
    message: string,
    timestamp: number,
}

export class DurableAudioGenerator extends DurableObject<Env> {
    private readonly audioRepository: IAudioRepository;
    private readonly chunksQeue: string[];
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.audioRepository = new AudioR2Repository(this.env.NOTICIEROS_STORAGE);
        this.chunksQeue = new Quw
    }

    async startAudioProceess(
        jobId: string,
        parts: Map<string, string>,
        instruction: string,
        approvedNoticiero: Noticiero,
    ) {
        await this.ctx.storage.put(`job_${jobId}`, {
            id: jobId,
            status: 'processing',
            startTime: Date.now()
        });

        this.processAudioGeneration(jobId, parts, instruction, approvedNoticiero)
            .catch(async (error) => {
                console.error(`Error en job ${jobId}:`, error);
                const wf = await this.env.AUDIO_GEN_WORKFLOW.get(jobId);
                await wf.sendEvent({
                    type: "audio-event",
                    payload: {
                        success: false,
                        message: "Generacion de audio fallida " + error.message,
                    }
                })
            });

        return { success: true, jobId };
    }

    async processAudioGeneration(jobId: string, parts: Map<string, string>, instruction: string, approvedNoticiero: Noticiero) {
        try {
            let idx = 1;
            for (const [key, value] of parts) {
                if (value !== "" && value !== "error") {
                    console.info("Fragmento ya generado, omitiendo ----");
                    continue;
                }
                console.info("Generando audio de parte: " + idx++);
                const base64 = await this.generateAudioWithAI(
                    instruction,
                    key,
                    this.env.GEMINI_API_KEY,
                )
                parts.set(key, base64);
            }

            const bienvenida = JSON.parse(await this.env.LATEST_NOTICIERO_ST.get("bienvenida") ?? "")
            const despedida = JSON.parse(await this.env.LATEST_NOTICIERO_ST.get("despedida") ?? "")
            const PCMs = [...bienvenida, ...parts.values(), ...despedida];
            const buffers = PCMs.map((pcm) => this.fbase64ToUint8Array(pcm));
            const totalLength = buffers.reduce((acc, arr) => acc + arr.length, 0);
            const bufferBase64 = new Uint8Array(totalLength);

            let offset = 0;
            for (const chunk of buffers) {
                bufferBase64.set(chunk, offset);
                offset += chunk.length;
            }

            console.info("Creando WAV");
            const audioWav = this.transformPCMToWAV(bufferBase64)
            console.info("Creando MP3");
            const audioMp3 = await this.transformWavToMp3(new Int16Array(audioWav.buffer));
            console.info("Almacenando WAV");
            await this.audioRepository.uploadAudioWAV(approvedNoticiero.id, audioWav);
            console.info(("Audio WAV almacenado correctamente con id: " + approvedNoticiero.id));
            console.info("Almacenando MP3");
            await this.audioRepository.uploadAudioMp3(approvedNoticiero.id, audioMp3);
            console.info(("Audio MP3 almacenado correctamente con id: " + approvedNoticiero.id));

            await this.ctx.storage.put(`job_${jobId}`, {
                id: jobId,
                status: 'completed',
                result: { success: true },
                endTime: Date.now()
            });

            const wf = await this.env.AUDIO_GEN_WORKFLOW.get(jobId);
            await wf.sendEvent({
                type: "audio-event",
                payload: JSON.stringify({
                    success: true,
                    message: "Audios generados correctamente",
                })
            })

        } catch (e: any) {
            console.error(e);
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
                        temperature: 0,
                    },
                });

                const base64Data =
                    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? "error";

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

                console.info(`Reintentando en ${delay} ms...`);
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

    async sendWebhook(webhookUrl: string, data: HookData) {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'CloudflareAudioProcessor/1.0'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                console.error(`Webhook failed: ${response.status} ${response.statusText}`);
            } else {
                console.info(`Webhook enviado exitosamente para job ${data.jobId}`);
            }

        } catch (error) {
            console.error("Error enviando webhook:", error);
            // No re-lanzar el error para no afectar el procesamiento principal
        }
    }
}