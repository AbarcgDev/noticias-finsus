import { GetNoticiasFromRss } from "@/application/useCases/GetNoticiasFromRss";
import { FuentesRepositoryD1 } from "@/infrastructure/persistence/FuentesRepositoryD1";
import { HttpRssFeedGateway } from "@/infrastructure/services/HttpRssFeed";
import { NoticiasCensorGateway } from "@/infrastructure/services/NoticiasCensor";
import { FeedParserGateway } from "@/infrastructure/services/RssFeedParser";
import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { CreateGuionRoute } from "./guiones.routes";
import { GeminiAIService } from "@/infrastructure/services/GeminiAPIService";
import { GenerateGuionAI } from "@/application/useCases/GenerateGuionAI";

export const create: ApiRouteHandler<CreateGuionRoute> = async (c: Context) => {
  console.info("Iniciando creacion periodica de Guion")
  const fuentesRepository = new FuentesRepositoryD1(c.env.DB)
  const IAgenerator = new GeminiAIService(c.env.GEMINI_API_KEY)
  const noticiasFinder = new GetNoticiasFromRss(
    fuentesRepository,
    new HttpRssFeedGateway(),
    new FeedParserGateway(),
    new NoticiasCensorGateway()
  )
  const noticias = await noticiasFinder.execute()
  c.executionCtx.waitUntil((async () => {
    const guionGenerator = new GenerateGuionAI(noticias, IAgenerator)
    const guion = await guionGenerator.excecute()

    await c.env.GUION_QUEUE.send({
      action: "guion.created",
      data: guion,
    })
  })())

  return c.json({
    id: crypto.randomUUID(),
    title: "Generacion",
    content: "Se está generando tu guion",
    createdAt: new Date,
    updatedAt: new Date
  }, 201)
}
