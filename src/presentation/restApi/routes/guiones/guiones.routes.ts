import { createRoute } from "@hono/zod-openapi";
import { GuionSchema } from "./guiones.schema";

export const create = createRoute({
  method: "get",
  path: "/guiones/create",
  responses: {
    201: {
      content: {
        "application/json": {
          schema: GuionSchema
        }
      },
      description: "Invioca el pipeline para la creacion de guiones",
    },
  }
});


export type CreateGuionRoute = typeof create;
