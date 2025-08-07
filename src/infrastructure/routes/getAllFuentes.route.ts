import { createRoute, z } from "@hono/zod-openapi";
import { FuenteSchema } from "../schemas/fuenteSchema";

export const GetAllFuentesRoute = createRoute({
    method: "get",
    path: "/api/fuentes",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.array(FuenteSchema)
                }
            },
            description: "Devuelve todas las fuentes disponibles",
        },
    }
});
