import { createRouter } from "@/lib/createApp";
import { createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";

const router = createRouter()

router.openapi(createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi(
              { example: "Bienvenida" }
            )
          })
        }
      },
      description: "Mensaje",
    },
  }
}), (c: Context) => {
  return c.json({
    message: "API noticias-finsus"
  })
});

export default router;
