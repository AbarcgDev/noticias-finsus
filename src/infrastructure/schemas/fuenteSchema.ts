import { z } from "@hono/zod-openapi";

export const FuenteSchema = z.object({
    id: z.string().openapi({ example: '1234-12' }),
    name: z.string().openapi({ example: 'Fuente de Noticias' }),
    rssUrl: z.string().openapi({ example: 'https://fuente.com/rss' }),
    active: z.boolean().openapi({ example: true }),
    createdAt: z.coerce.date().openapi({ example: '2023-10-01T12:00:00Z' }),
    updatedAt: z.coerce.date().openapi({ example: '2023-10-01T12:00:00Z' }),
});