import { createRoute, z } from "@hono/zod-openapi";

export const loginRoute = createRoute({
    method: "post",
    path: "/login",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        email: z.email()
                    })
                }
            }

        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        token: z.string()
                    })
                }
            },
            description: "Solicita Creación de Token",
        },
        403: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "Usuario no autorizado",
        }
    }
});

export type LoginRoute = typeof loginRoute;