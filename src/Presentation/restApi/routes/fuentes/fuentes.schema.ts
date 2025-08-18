import { z } from "@hono/zod-openapi";

export const CanalRSSSchema = z.object({
  id: z.string().openapi({ example: '1234-12' }),
  name: z.string().openapi({ example: 'Fuente de Noticias' }),
  rssUrl: z.string().openapi({ example: 'https://fuente.com/rss' }),
  active: z.boolean().openapi({ example: true }),
});
