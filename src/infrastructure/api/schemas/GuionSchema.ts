import { z } from "@hono/zod-openapi";

export const GuionSchema = z.object({
    id: z.string(),
    title: z.string().default("Noticiero Finsus - " + new Date().toLocaleDateString("es-MX", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })),
    content: z.string().nonempty(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
