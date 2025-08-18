import { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export interface AppEnv {
  Bindings: Cloudflare
}

export type cloudflareApp = OpenAPIHono<AppEnv>

export type ApiRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>
