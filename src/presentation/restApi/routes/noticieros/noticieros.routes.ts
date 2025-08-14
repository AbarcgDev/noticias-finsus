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

export const getNoticieroById = createRoute({
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
            description: "Devuelve Noticiero Solicitado",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontró guion solicidado",
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

export const getNoticieroAudioMP3 = createRoute({
    method: "get",
    path: "/noticieros/{id}/audio/mp3",
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: {
            headers: z.object({
                "Content-Type": z.string().openapi({
                    description: "El tipo de contenido del archivo. 'audio/mpeg' para archivos MP3.",
                    example: "audio/mpeg",
                }),
                "Content-Disposition": z.string().openapi({
                    description: "Indica al cliente cómo manejar el archivo. 'inline' para reproducirlo directamente.",
                    example: "inline",
                }),
            }),
            content: {
                "audio/mpeg": {
                    schema: z.string().openapi({
                        format: "binary",
                    }),
                },
            },
            description: "Devuelve audio MP3 del noticiero",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string()
                    })
                }
            },
            description: "No se encontró audio",
        },
    }
});

export const updateNoticieroState = createRoute({
  method: "put",
  path: "/noticiero/{id}/state",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            state: z.enum(["noticiero.validated"]),
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
            message: z.string().openapi({
              example: "Noticiero actualizado"
            })
          })
        },
      },
      description: "Notifica actualización de guion",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "No se encontró el guion con el ID proporcionado",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string()
          })
        },
      },
      description: "Parametros no recibidos"
    }
  }
});

export const updateNoticieroGuion = createRoute({
  method: "put",
  path: "/noticiero/{id}/guion",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guion: z.string(),
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
            message: z.string().openapi({
              example: "Noticiero actualizado"
            })
          })
        },
      },
      description: "Notifica actualización de guion",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "No se encontró el guion con el ID proporcionado",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string()
          })
        },
      },
      description: "Parametros no recibidos"
    }
  }
});

export type GetNoticieroByIdRoute = typeof getNoticieroById;
export type GetNoticieroAudioMP3Route = typeof getNoticieroAudioWAV;
export type GetNoticieroAudioWAVRoute = typeof getNoticieroAudioWAV;
export type ListNoticierosRoute = typeof list;
export type UpdateNoticieroStateRoute = typeof updateNoticieroState;
export type UpdateNoticieroGuionRoute = typeof updateNoticieroGuion;
