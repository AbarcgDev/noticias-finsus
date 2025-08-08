import notFound from "./infrastructure/middlewares/notFoundHandler";
import onError from "./infrastructure/middlewares/errorHandler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getNoticiaRoute } from "./infrastructure/routes/getNoticia.route";
import { Context } from "hono";
import { GetAllFuentesRoute } from "./infrastructure/routes/getAllFuentes.route";
import { handleGetAllFuentesReq } from "./infrastructure/handlers/handleGetAllFuentesReq";
import { handleGetNoticiasReq } from "./infrastructure/handlers/handleGetNoticias";
import { GetNoticiasRoute } from "./infrastructure/routes/getNoticias.route";
import { GuionGeneration } from "./infrastructure/ai/GuionGeneration";
import { GenerateGuionRoute } from "./infrastructure/routes/generateGuionRoute";
import { handleGetGuion } from "./infrastructure/handlers/handleGetGuion";

const app = new OpenAPIHono<{ Bindings: Cloudflare }>({
  strict: false,
});

app.openapi(GetAllFuentesRoute, handleGetAllFuentesReq);

app.openapi(GetNoticiasRoute, handleGetNoticiasReq);

app.openapi(GenerateGuionRoute, handleGetGuion);

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
