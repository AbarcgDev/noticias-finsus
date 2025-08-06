import notFound from "./middlewares/notFoundHandler";
import onError from "./middlewares/errorHandler";
import { OpenAPIHono } from "@hono/zod-openapi";
import getNoticiaRoute from "./routes/getNoticia.route";
import { Context } from "hono";

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

app.notFound(notFound);

app.onError(onError);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})

export default {
  fetch: app.fetch
};
