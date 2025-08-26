import { createRoute, z } from "@hono/zod-openapi";

export const list = createRoute({
    method: "get",
    path: "/censorList",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        list: z.array(z.string())
                    })
                }
            },
            description: "Lista fuentes disponibles",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "Lista no encontrada"
        },
    }
});
export type GetCensorListRoute = typeof list;