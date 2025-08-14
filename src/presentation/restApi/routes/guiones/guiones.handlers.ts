import { GetNoticiasFromRss } from "@/application/useCases/GetNoticiasFromRss";
import { FuentesRepositoryD1 } from "@/infrastructure/persistence/FuentesRepositoryD1";
import { HttpRssFeedGateway } from "@/infrastructure/services/HttpRssFeed";
import { NoticiasCensorGateway } from "@/infrastructure/services/NoticiasCensor";
import { FeedParserGateway } from "@/infrastructure/services/RssFeedParser";
import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { CreateGuionRoute, GetGuionByIdRoute, UpdateGuionStateRoute } from "./guiones.routes";
import { GuionEvent } from "@/domain/GuionContext/GuionEvent";
import { Guion } from "@/domain/GuionContext/Guion";
import { GuionD1Repository } from "@/infrastructure/persistence/GuionRepository";
import { GetGuionById } from "@/application/useCases/GetGuionById";
import { SaveGuion } from "@/application/SaveGuion";

export const create: ApiRouteHandler<CreateGuionRoute> = async (c: Context) => {
  console.info("Iniciando creacion periodica de Guion")
  const fuentesRepository = new FuentesRepositoryD1(c.env.DB)
  const noticiasFinder = new GetNoticiasFromRss(
    fuentesRepository,
    new HttpRssFeedGateway(),
    new FeedParserGateway(),
    new NoticiasCensorGateway()
  )
  const guion = Guion.fromObject({
    content: "En cola",
    status: "Queued"
  })
  c.executionCtx.waitUntil((async () => {
    await c.env.GUION_QUEUE.send({
      action: GuionEvent.Queued,
      data: guion,
    })
    console.info("Guion en cola: ", guion.id)
  })())

  return c.json({
    message: "Tu guion se está generando",
    data: {
      id: guion.id,
      title: guion.title,
      content: guion.content,
      createdAt: guion.createdAt,
      updatedAt: guion.updatedAt
    }
  }, 201)
}

export const getGuionById: ApiRouteHandler<GetGuionByIdRoute> = async (c: Context) => {
  const { id } = c.req.param()
  const guionRepository = new GuionD1Repository(c.env.DB);
  const guionFinder = new GetGuionById(guionRepository);
  const guion = await guionFinder.execute(id);
  console.info(guion.status);
  if (guion.status === "guion.on-validation") {
    return c.json({
      message: "El guion aun no está listo"
    }, 202)
  }
  return c.json({
    id: guion.id,
    title: guion.title,
    content: guion.content,
    createdAt: guion.createdAt,
    updatedAt: guion.updatedAt,
    status: guion.status
  }, 200)
}

export const update: ApiRouteHandler<UpdateGuionStateRoute> = async (c: Context) => {
  const data = await c.req.json()
  const { id } = c.req.param()
  if (!data.state || !id) {
    return c.json({
      message: "El parametro id y el cuerpo con state son obligatorios"
    }, 400);
  }
  const guionRepository = new GuionD1Repository(c.env.DB);
  const guionFinder = new GetGuionById(guionRepository);
  const guion = await guionFinder.execute(id);
  if (!guion) {
    return c.json({
      message: "Guion no encontrado"
    }, 404)
  }
  guion.setStatus(data.state);
  const guionSaver = new SaveGuion(guionRepository);
  await guionSaver.update(guion);
  if (data.state === GuionEvent.Validated) {
    c.executionCtx.waitUntil((async () => {
      await c.env.GUION_QUEUE.send({
        action: GuionEvent.Validated,
        data: guion,
      })
      console.info("Guion Validado: ", guion.id)
    })())
  }
  return c.json({
    message: "Guion actualizado",
  }, 200)
}
