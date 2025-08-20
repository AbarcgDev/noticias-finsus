import { NoticieroState } from "@/Data/Models/NoticieroState";
import { pipelineAudio } from "@/Data/Pipelines/PipelineAudio";
import { IAudioRepository } from "@/Repositories/IAudioRepository";
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository";
import { INoticierosRepository } from "@/Repositories/INoticierosRepositrory";
import { WorkerEntrypoint, WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { AudioR2Repository } from "./NoticieroAudioR2Repository";
import { NoticierosD1Repository } from "./NoticierosD1Repository";
import { LatestNoticieroKVRepository } from "./LatestNoticieroKVRepository";

export type AudioGenParams = {
    noticieroId: string,
}

export class AudioGenerationWorkflow extends WorkflowEntrypoint<Cloudflare.Env, AudioGenParams> {
    async run(event: WorkflowEvent<AudioGenParams>, step: WorkflowStep) {
        const noticeroRepository = new NoticierosD1Repository(this.env.DB)
        const audioRepository = new AudioR2Repository(this.env.NOTICIEROS_STORAGE)
        const latestNoticieroRepository = new LatestNoticieroKVRepository(this.env.LATEST_NOTICIERO_ST)
        console.info("Generando audio de noticiero aprobado: " + event.payload.noticieroId)

        try {

            const approvedNoticiero = await step.do("Obteniendo información del noticiero", async () => {
                return await noticeroRepository.findById(event.payload.noticieroId);
            })

            if (approvedNoticiero) {
                await step.do("Generando audio", async () => {
                    await pipelineAudio(approvedNoticiero, this.env.GEMINI_API_KEY, audioRepository)
                });

                await step.do("Actualizando Noticiero", async () => {
                    approvedNoticiero.state = NoticieroState.APPROVED;
                    approvedNoticiero.publicationDate = new Date();
                    await latestNoticieroRepository.insertLatest(approvedNoticiero)
                })

                console.info("Noticiero más reciente actualizado")
            }
        } finally {
            noticeroRepository.dispose()
            audioRepository.dispose()
            latestNoticieroRepository.dispose()
        }
    }
}