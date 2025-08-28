import { createRouter } from "@/lib/createApp";
import * as routes from "./login.routes"
import * as handlers from "./login.handlers"

const router = createRouter()
    .openapi(routes.loginRoute, handlers.loginHandler)

export default router;