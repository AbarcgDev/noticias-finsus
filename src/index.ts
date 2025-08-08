import notFound from "./infrastructure/middlewares/notFoundHandler";
import onError from "./infrastructure/middlewares/errorHandler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getNoticiaRoute } from "./infrastructure/routes/getNoticia.route";
import { Context } from "hono";
import { GetAllFuentesRoute } from "./infrastructure/routes/getAllFuentes.route";
import { handleGetAllFuentesReq } from "./infrastructure/handlers/handleGetAllFuentesReq";
import { handleGetNoticiasReq } from "./infrastructure/handlers/handleGetNoticias";
import { GetNoticiasRoute } from "./infrastructure/routes/getNoticias.route";

const app = new OpenAPIHono<{ Bindings: Cloudflare }>({
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

app.openapi(GetNoticiasRoute, handleGetNoticiasReq);

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
  fetch: app.fetch,
};
