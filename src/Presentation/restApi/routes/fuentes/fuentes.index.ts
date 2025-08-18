import { createRouter } from "../../../../lib/createApp";
import * as routes from "./fuentes.routes"
import * as handlers from "./fuentes.handlers"

const router = createRouter()
  .openapi(routes.list, handlers.list);

export default router;
