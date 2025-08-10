import { createRoute, z } from "@hono/zod-openapi";
import { FuenteSchema } from "./fuentes.schema";

export const list = createRoute({
  method: "get",
  path: "/fuentes",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(FuenteSchema)
        }
      },
      description: "Lista fuentes disponibles",
    },
  }
});

export type ListFuentesRoute = typeof list;

