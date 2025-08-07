import { createRoute, z } from "@hono/zod-openapi";
import NoticiaSchema from "../schemas/noticiaSchema";

export const GetNoticiasRoute = createRoute({
    method: "get",
    path: "/api/noticias",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.array(NoticiaSchema)
                }
            },
            description: "Devuelve todas las noticias disponibles",
        },
    }
});
