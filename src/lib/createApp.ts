import { OpenAPIHono } from "@hono/zod-openapi";
import { cloudflareApp } from "./types";
import notFound from "@/Presentation/restApi/middlewares/notFoundHandler";
import onError from "@/Presentation/restApi/middlewares/errorHandler";


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

