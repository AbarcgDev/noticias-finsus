import { createRoute, z } from "@hono/zod-openapi";
import { GuionSchema } from "./guiones.schema";

export const GuionQueuedResponse = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    title: z.string().default("Noticiero Finsus - " + new Date().toLocaleDateString("es-MX", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })),
    createdAt: z.date().default(() => new Date()),
  })
});

export const create = createRoute({
  method: "post",
  path: "/guiones",
  responses: {
    201: {
      content: {
        "application/json": {
          schema: GuionQueuedResponse
        }
      },
      description: "Invoca el pipeline para la creacion de guiones",
    },
  }
});

export const getGuionById = createRoute({
  method: "get",
  path: "/guiones/{id}",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GuionSchema,
        },
      },
      description: "Devuelve un guion específico usando su ID",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "No se encontró el guion con el ID proporcionado",
    },
    202: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "El guion no está listo",
    },
  }
});

export const update = createRoute({
  method: "put",
  path: "/guiones/{id}",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: GuionSchema
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
              example: "Guion actualizado"
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
  }
});


export type CreateGuionRoute = typeof create;
export type GetGuionByIdRoute = typeof getGuionById;
export type UpdateGuionRoute = typeof update;

