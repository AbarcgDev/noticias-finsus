import { createRouter } from "../../../../lib/createApp";
import * as routes from "./censorList.routes"
import * as handlers from "./censorList.handlers"

const router = createRouter()
    .openapi(routes.list, handlers.list);

export default router;
