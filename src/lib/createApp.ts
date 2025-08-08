import { OpenAPIHono } from "@hono/zod-openapi";
import { handleGetNoticiasReq } from "@/infrastructure/api/handlers/handleGetNoticias";
import onError from "@/infrastructure/api/middlewares/errorHandler";
import notFound from "@/infrastructure/api/middlewares/notFoundHandler";
import { GetNoticiasRoute } from "@/infrastructure/api/routes/getNoticias.route";
import { cloudflareApp } from "./types";


export function createRouter(): cloudflareApp {
  return new OpenAPIHono<{ Bindings: Cloudflare }>({
    strict: false,
  });
}

export default function createApp(): cloudflareApp {
  const app = createRouter()

  app.openapi(GetNoticiasRoute, handleGetNoticiasReq);

  app.notFound(notFound);

  app.onError(onError);

  return app;
}

