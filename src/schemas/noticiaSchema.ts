import { z } from "@hono/zod-openapi";

const NoticiaSchema = z.object({
  id: z.string().openapi({
    example: "1234-12"
  }),
  title: z.string().openapi({
    example: "Titular De Noticia Importante"
  }),
  description: z.string().openapi({
    example: "La noticia importante habla de algo muy importante"
  })
}).openapi("Noticia");

export default NoticiaSchema;
