import { createRouter } from "@/lib/createApp";
import * as routes from "@/infrastructure/api/routes/fuentes/fuentes.routes"
import * as handlers from "@/infrastructure/api/routes/fuentes/fuentes.handlers"

const router = createRouter()
  .openapi(routes.list, handlers.list);

export default router;
