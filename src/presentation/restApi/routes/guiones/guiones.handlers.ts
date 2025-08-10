import { GetNoticiasFromRss } from "@/application/useCases/GetNoticiasFromRss";
import { GuionGeneration } from "@/infrastructure/ai/GuionGeneration";
import { FuentesRepositoryD1 } from "@/infrastructure/persistence/FuentesRepositoryD1";
import { HttpRssFeedGateway } from "@/infrastructure/services/HttpRssFeed";
import { NoticiasCensorGateway } from "@/infrastructure/services/NoticiasCensor";
import { FeedParserGateway } from "@/infrastructure/services/RssFeedParser";
import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { CreateGuionRoute } from "./guiones.routes";

export const create: ApiRouteHandler<CreateGuionRoute> = async (c: Context) => {
  const generator = new GuionGeneration(c.env.AI);
  const noticiasFetcher = new GetNoticiasFromRss(
    new FuentesRepositoryD1(c.env.DB),
    new HttpRssFeedGateway(),
    new FeedParserGateway(),
    new NoticiasCensorGateway()
  )
  const noticias = await noticiasFetcher.execute()

  c.executionCtx.waitUntil((async () => {
    const guion = await generator.generateGuion(noticias);
    const insertQuery = c.env.DB.prepare("INSERT INTO guiones (id, title, content, created_at, updated_at) VALUES (?,?,?,?,?)");
    console.info(guion.content);
    return insertQuery.bind(
      guion.id,
      guion.title,
      guion.content,
      guion.createdAt.toISOString(),
      guion.updatedAt.toISOString()).run();
  })());

  return c.json({
    id: crypto.randomUUID(),
    title: "Generacion",
    content: "Se está generando",
    createdAt: new Date,
    updatedAt: new Date
  }, 201)
}
