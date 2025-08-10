import { OpenAPIHono } from "@hono/zod-openapi";
import { cloudflareApp } from "./types";
import notFound from "@/presentation/restApi/middlewares/notFoundHandler";
import onError from "@/presentation/restApi/middlewares/errorHandler";


export function createRouter(): cloudflareApp {
  return new OpenAPIHono<{ Bindings: Cloudflare }>({
    strict: false,
  });
}

export default function createApp(): cloudflareApp {
  const app = createRouter()

  app.notFound(notFound);

  app.onError(onError);

  return app;
}

