import { createRouter } from "@/lib/createApp";
import * as routes from "./guiones.routes"
import * as handlers from "./guiones.handlers"

const router = createRouter()
  .openapi(routes.create, handlers.create)

export default router;
