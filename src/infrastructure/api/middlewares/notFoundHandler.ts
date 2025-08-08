import { Context, NotFoundHandler } from "hono";

const notFound: NotFoundHandler = (c: Context) => {
  c.status(404)
  return c.json({
    message: `Ruta ${c.req.path} no encontrada`
  })
}

export default notFound
