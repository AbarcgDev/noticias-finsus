import { z } from "@hono/zod-openapi";

export const NoticieroSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    guion: z.string(),
    state: z.string(),
    publicationDate: z.date(),
    approvedBy: z.string()
})