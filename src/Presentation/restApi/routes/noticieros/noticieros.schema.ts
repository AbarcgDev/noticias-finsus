import { z } from "@hono/zod-openapi";

export const NoticieroSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    transcript: z.string(),
    wavAudioId: z.string(),
    publication_date: z.date()
})