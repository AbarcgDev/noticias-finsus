import { NoticieroState } from "../Models/NoticieroState"
import { INoticierosRepository } from "../../Repositories/INoticierosRepositrory"
import { pipelineAudio } from "./PipelineAudio"
import { IAudioRepository } from "../../Repositories/IAudioRepository"

export const pipelineNoticieroApproved = async (
    audioRepository: IAudioRepository,
    noticeroRepository: INoticierosRepository,
    geminiAPIKey: string, noticieroId: string,
    context: ExecutionContext
) => {
    console.info("Generando audio de noticiero aprovado")
    const approvedNoticiero = await noticeroRepository.findById(noticieroId);
    if (approvedNoticiero) {
        context.waitUntil(
            pipelineAudio(approvedNoticiero, geminiAPIKey, audioRepository)
        )
    }
}