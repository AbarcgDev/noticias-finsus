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
import { timeout } from "hono/timeout";

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
            await step.do("Iniciando generacion async de audio", async () => {
                const id = this.env.AUDIO_GENERATOR.idFromName(approvedNoticiero.id);
                const stub = this.env.AUDIO_GENERATOR.get(id);
                await stub.startAudioGen([...parts.values()], event.instanceId, approvedNoticiero.id);
            });

            await step.do("Esperando generacion de audio", {
                retries: {
                    limit: 0,
                    delay: 1000
                }
            }, async () => {
                console.info("Esperando eventos");
                const result = await step.waitForEvent("Esperando eventos", {
                    type: "audio-generated",
                    timeout: 600000,
                });
                console.info("Audio Generado: ", result);
            })

            await step.do("Actualizando Noticiero", async () => {
                console.info("Actualizando noticiero");
                approvedNoticiero.state = NoticieroState.PUBLISHED;
                approvedNoticiero.publicationDate = new Date();
                await latestNoticieroRepository.insertLatest(approvedNoticiero)
                await noticeroRepository.save(approvedNoticiero);
            })
        }
        console.info("Noticiero más reciente actualizado")
    }
}