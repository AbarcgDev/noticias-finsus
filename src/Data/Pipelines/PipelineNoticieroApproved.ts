import { NoticieroState } from "../Models/NoticieroState"
import { INoticierosRepository } from "../../Repositories/INoticierosRepositrory"
import { pipelineAudio } from "./PipelineAudio"
import { IAudioRepository } from "../../Repositories/IAudioRepository"
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository"

export const pipelineNoticieroApproved = async (
    audioRepository: IAudioRepository,
    noticeroRepository: INoticierosRepository,
    latestNoticieroRepository: ILatestNoticieroRepository,
    geminiAPIKey: string, noticieroId: string,
    context: ExecutionContext
) => {
    console.info("Generando audio de noticiero aprobado")
    const approvedNoticiero = await noticeroRepository.findById(noticieroId);
    if (approvedNoticiero) {
        approvedNoticiero.state = NoticieroState.APPROVED
        approvedNoticiero.publicationDate = new Date(),
            context.waitUntil((async (): Promise<void> => {
                await pipelineAudio(approvedNoticiero, geminiAPIKey, audioRepository)
                await latestNoticieroRepository.insertLatest(approvedNoticiero)
                console.info("Noticiero más reciente actualizado")
            })()
            )
    }
}