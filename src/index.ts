import resApi from "@/presentation/restApi"
import { GenerateGuionAI } from "./application/useCases/GenerateGuionAI";
import { FuentesRepositoryD1 } from "./infrastructure/persistence/FuentesRepositoryD1";
import { GeminiAIService } from "./infrastructure/services/GeminiAPIService";
import { GetNoticiasFromRss } from "./application/useCases/GetNoticiasFromRss";
import { HttpRssFeedGateway } from "./infrastructure/services/HttpRssFeed";
import { FeedParserGateway } from "./infrastructure/services/RssFeedParser";
import { NoticiasCensorGateway } from "./infrastructure/services/NoticiasCensor";
import { GuionEvent, GuionEventMsg } from "./domain/GuionContext/GuionEvent";
import { guionQueueHandler } from "./infrastructure/queues/guionQueueHandler";
import { Guion } from "./domain/GuionContext/Guion";
import { SaveGuion } from "./application/SaveGuion";
import { GuionD1Repository } from "./infrastructure/persistence/GuionRepository";

export default {
  fetch: resApi.fetch,
  async scheduled(controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    console.info("Iniciando creacion periodica de Guion: ", new Date(controller.scheduledTime).toISOString());
    ctx.waitUntil((async (env: Env) => {
      const fuentesRepository = new FuentesRepositoryD1(env.DB)
      const IAgenerator = new GeminiAIService(env.GEMINI_API_KEY)
      const noticiasFinder = new GetNoticiasFromRss(
        fuentesRepository,
        new HttpRssFeedGateway(),
        new FeedParserGateway(),
        new NoticiasCensorGateway()
      )
      const guionSaver = new SaveGuion(new GuionD1Repository(env.DB))
      const noticias = await noticiasFinder.execute()
      const guionGenerator = new GenerateGuionAI(noticias, IAgenerator)
      const content = await guionGenerator.excecute()
      const guion = Guion.create(content, "READY")
      guionSaver.execute(guion)
      console.info("Guion generado con id: ", guion.id)
      env.GUION_QUEUE.send({
        action: GuionEvent.Created,
        data: guion
      } as GuionEventMsg)
    })(env))
  },
  async queue(batch: MessageBatch<GuionEventMsg>, env: Env) {
    await guionQueueHandler(batch, env);
  }
};
