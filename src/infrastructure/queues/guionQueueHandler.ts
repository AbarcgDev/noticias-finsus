import { SaveGuion } from "@/application/SaveGuion";
import { Guion } from "@/domain/GuionContext/Guion";
import { GuionEvent, GuionEventMsg } from "@/domain/GuionContext/GuionEvent";
import { GuionD1Repository } from "../persistence/GuionRepository";
import { GenerateGuionAI } from "@/application/useCases/GenerateGuionAI";
import { GetNoticiasFromRss } from "@/application/useCases/GetNoticiasFromRss";
import { FuentesRepositoryD1 } from "../persistence/FuentesRepositoryD1";
import { HttpRssFeedGateway } from "../services/HttpRssFeed";
import { FeedParserGateway } from "../services/RssFeedParser";
import { NoticiasCensorGateway } from "../services/NoticiasCensor";
import { GeminiAIService } from "../services/GeminiAPIService";
import { GenerateAudioFile } from "@/application/useCases/GenerateAdioFile";
import { Noticiero } from "@/domain/noticieros/Noticiero";
import { NoticierosD1Repository } from "../persistence/NoticierosD1Repository";
import { NoticieroAudioR2Repository } from "../persistence/NoticieroAudioR2Repository";

export async function guionQueueHandler(batch: MessageBatch<GuionEventMsg>, env: Env) {
    const saveGuionUseCase = new SaveGuion(
        new GuionD1Repository(env.DB)
    )
    const noticiasFinder = new GetNoticiasFromRss(
        new FuentesRepositoryD1(env.DB),
        new HttpRssFeedGateway(),
        new FeedParserGateway(),
        new NoticiasCensorGateway(),
    )

    const noticierosRepository = new NoticierosD1Repository(env.DB)
    for (const message of batch.messages) {
        try {
            const payload = message.body
            switch (payload.action) {
                case GuionEvent.Queued:
                    const noticias = await noticiasFinder.execute()
                    const guionGenerator = new GenerateGuionAI(noticias, new GeminiAIService(env.GEMINI_API_KEY))
                    const guionContent = await guionGenerator.excecute()
                    const guion = Guion.fromObject({
                        id: payload.data.id,
                        title: payload.data.title,
                        content: guionContent,
                        createdAt: payload.data.createdAt,
                        updatedAt: payload.data.updatedAt,
                        status: "READY"
                    })
                    await saveGuionUseCase.save(Guion.fromObject(guion))
                    console.info("Guion, creado id: ", guion.id)
                    await env.GUION_QUEUE.send({
                        action: GuionEvent.Created,
                        data: Guion,
                    });
                    message.ack()
                    break;
                case GuionEvent.Created:
                    // TODO: Llamar servicio de email
                    message.ack()
                    break;
                case GuionEvent.Validated:
                    console.info("Generando audio de guion validado: " + payload.data.id);
                    const audioGenerator = new GenerateAudioFile(
                        new GeminiAIService(env.GEMINI_API_KEY)
                    )
                    const audioWav = await audioGenerator.execute(
                        "Lee en tono informativo, presentador de noticias",
                        payload.data.content
                    )
                    const audioWavName = payload.data.id
                    const audioRepo = new NoticieroAudioR2Repository(env.NOTICIEROS_STORAGE)
                    await audioRepo.uploadAudioWAV(audioWavName, audioWav)
                    console.info("Audio almacenado correctamente")
                    const noticiero = new Noticiero(
                        undefined,
                        payload.data.title,
                        payload.data.content,
                        audioWavName,
                    )
                    await noticierosRepository.createNoticiero(noticiero)
                    console.info("Noticiero creado correctamente: ", noticiero.id)
                    message.ack()
                    break;
            }
        }
        catch (e) {
            console.error("Error procesando eventos: ", e)
        }
    }
}
