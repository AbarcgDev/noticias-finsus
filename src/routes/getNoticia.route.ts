import { createRoute, z } from "@hono/zod-openapi";
import NoticiaSchema from "../schemas/noticiaSchema";

const getNoticiaParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: "id",
        in: "path"
      },
      example: "812812-1212"
    })
});

const getNoticiaRoute = createRoute({
  method: "get",
  path: "/api/noticias/{id}",
  request: {
    params: getNoticiaParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NoticiaSchema
        },
      },
      description: "Devuelve la noticia solicitada",
    },
  },
});

export default getNoticiaRoute;
