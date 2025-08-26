import { createRoute, z } from "@hono/zod-openapi";
import { NoticieroSchema } from "./noticieros.schema";
import { getLatestNoticieroAudio } from "./noticieros.handlers";
import { NoticieroState } from "@/Data/Models/NoticieroState";

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


export const getByID = createRoute({
    method: "get",
    path: "/noticieros/{id}",
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: NoticieroSchema
                }
            },
            description: "Devuelve noticiero publicados",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontraron noticieros",
        },
    }
});

export const create = createRoute({
    method: "post",
    path: "/noticieros",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        noticiero_id: z.string()
                    })
                }
            },
            description: "Inicia creacion de noticiero",
        },
    }
});

export const getNoticieroAudioWAV = createRoute({
    method: "get",
    path: "/noticieros/{id}/audio/{format}",
    request: {
        params: z.object({
            id: z.uuid(),
            format: z.enum(["wav", "mp3"])
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

export const getLatestNoticiero = createRoute({
    method: "get",
    path: "/noticieros/latest",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: NoticieroSchema
                }
            },
            description: "Devuelve la información del noticiero más reciente"
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "Reporta error si no encuentra noticiero"
        }
    }
})

export const getNoticieroLatestAudio = createRoute({
    method: "get",
    path: "/noticieros/latest/audio/{format}",
    request: {
        params: z.object({
            format: z.enum(["wav", "mp3"])
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

export const getLatestDraft = createRoute({
    method: "get",
    path: "/noticieros/latest/draft",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: NoticieroSchema
                },
            },
            description: "Devuelve el ultimo borrador",
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

export const updateNoticiero = createRoute({
    method: "put",
    path: "/noticieros/{id}",
    request: {
        params: z.object({
            id: z.uuid(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        title: z.string().optional(),
                        guion: z.string().optional(),
                        state: z.enum([NoticieroState.APPROVED]),
                        approvedBy: z.string().optional()
                    })
                }
            }
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "Actualiza noticiero",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontró noticiero",
        },
    }
});

export type UpdateNoticeroRoute = typeof updateNoticiero;
export type ListNoticierosRoute = typeof list;
export type GetNoticieroAudioWAVRoute = typeof getNoticieroAudioWAV
export type GetLatestNoticiero = typeof getLatestNoticiero
export type GetLatestNoticieroAudio = typeof getNoticieroLatestAudio
export type CreateNoticieroRoute = typeof create;
export type GetByIDRoute = typeof getByID;
export type GetLatestDraftRoute = typeof getLatestDraft;