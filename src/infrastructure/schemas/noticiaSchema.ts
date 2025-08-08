import { z } from "@hono/zod-openapi";

const NoticiaSchema = z.object({
  id: z.string().openapi({
    example: "1234-12"
  }),
  title: z.string().openapi({
    example: "Titular De Noticia Importante"
  }),
  categories: z.array(z.string()).openapi({
    example: ["Negocios", "Economía"]
  }),
  content: z.string().openapi({
    example: "La noticia importante habla de algo muy importante"
  }),
  publicationDate: z.coerce.date().openapi({ example: "2023-10-01T12:00:00Z" }),
  source: z.string().openapi({ example: "Fuente de la Noticia" }),
}).openapi("Noticia");

export default NoticiaSchema;
