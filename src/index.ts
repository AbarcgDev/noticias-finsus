import notFound from "./infrastructure/middlewares/notFoundHandler";
import onError from "./infrastructure/middlewares/errorHandler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getNoticiaRoute } from "./infrastructure/routes/getNoticia.route";
import { Context } from "hono";
import { GetAllFuentesRoute } from "./infrastructure/routes/getAllFuentes.route";
import { handleGetAllFuentesReq } from "./handlers/handleGetAllFuentesReq";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>({
  strict: false,
});

app.openapi(getNoticiaRoute, (c: Context) => {
  const { id } = c.req.valid("param");
  return c.json({
    id: "12323",
    title: "La Gran Noticia",
    description: "Sucedio un gran acontecimiento",
  })
});

app.openapi(GetAllFuentesRoute, handleGetAllFuentesReq);

app.notFound(notFound);

app.onError(onError);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
});

export default {
  fetch: app.fetch
};
