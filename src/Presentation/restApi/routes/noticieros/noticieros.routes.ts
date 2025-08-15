import { createRoute, z } from "@hono/zod-openapi";
import { NoticieroSchema } from "./noticieros.schema";

export const list = createRoute({
    method: "get",
    path: "/noticieros",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.array(NoticieroSchema)
                }
            },
            description: "Devuelve lista de noticieros publicados",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontraron guiones",
        },
    }
});

export const getNoticieroAudioWAV = createRoute({
    method: "get",
    path: "/noticieros/{id}/audio/wav",
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: {
            headers: z.object({
                "Content-Type": z.string().openapi({
                    description: "El tipo de contenido del archivo. 'audio/wav' para archivos WAV.",
                    example: "audio/wav",
                }),
                "Content-Disposition": z.string().openapi({
                    description: "Indica al cliente cómo manejar el archivo. 'inline' para reproducirlo directamente.",
                    example: "inline",
                }),
            }),
            content: {
                "audio/wav": {
                    schema: z.string().openapi({
                        format: "binary",
                    }),
                },
            },
            description: "Devuelve audio WAV del noticiero",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontraron guiones",
        },
    }
});


export type ListNoticierosRoute = typeof list;
export type GetNoticieroAudioWAVRoute = typeof getNoticieroAudioWAV