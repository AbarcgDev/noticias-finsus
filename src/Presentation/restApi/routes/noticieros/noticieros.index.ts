import { createRouter } from "../../../../lib/createApp";
import * as routes from "./noticieros.routes";
import * as handlers from "./noticieros.handlers";

const router = createRouter()
    .openapi(routes.list, handlers.list)
    .openapi(routes.getNoticieroAudioWAV, handlers.getNoticieroAudioWAV)
    .openapi(routes.updateNoticiero, handlers.update)

export default router;