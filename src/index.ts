import resApi from "@/presentation/restApi"
import { GenerateGuionAI } from "./application/useCases/GenerateGuionAI";
import { FuentesRepositoryD1 } from "./infrastructure/persistence/FuentesRepositoryD1";
import { GeminiAIService } from "./infrastructure/services/GeminiAPIService";
import { GetNoticiasFromRss } from "./application/useCases/GetNoticiasFromRss";
import { HttpRssFeedGateway } from "./infrastructure/services/HttpRssFeed";
import { FeedParserGateway } from "./infrastructure/services/RssFeedParser";
import { NoticiasCensorGateway } from "./infrastructure/services/NoticiasCensor";
import { GuionEvent } from "./domain/GuionContext/GuionEvent";

export default {
  fetch: resApi.fetch,
  async schedule(event: Event, env: Env, ctx: ExecutionContext) {
    console.info("Iniciando creacion periodica de Guion")
    const fuentesRepository = new FuentesRepositoryD1(env.DB)
    const IAgenerator = new GeminiAIService(env.GEMINI_API_KEY)
    const noticiasFinder = new GetNoticiasFromRss(
      fuentesRepository,
      new HttpRssFeedGateway(),
      new FeedParserGateway(),
      new NoticiasCensorGateway()
    )
    const noticias = await noticiasFinder.execute()
    const guionGenerator = new GenerateGuionAI(noticias, IAgenerator)
    const guion = await guionGenerator.excecute()
    console.info("Guion Generado Correctamente");
    console.info(JSON.stringify(guion))
  },
  async queue(batch: MessageBatch<GuionEvent>, env: Env) {
    for (const message of batch.messages) {
      try {
        const payload = message.body
        switch (payload.action) {
          case "guion.created":
            console.info(JSON.stringify(payload.data))
        }
      }
      catch (e) {
        console.error("Error procesando eventos: ", e)
      }
    }
  }
};
