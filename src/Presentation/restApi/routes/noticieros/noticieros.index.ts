import { createRouter } from "../../../../lib/createApp";
import * as routes from "./noticieros.routes";
import * as handlers from "./noticieros.handlers";
import { handle } from "hono/cloudflare-pages";

const router = createRouter()
    .openapi(routes.list, handlers.list)
    .openapi(routes.getNoticieroLatestAudio, handlers.getLatestNoticieroAudio)
    .openapi(routes.getNoticieroAudioWAV, handlers.getNoticieroAudioWAV)
    .openapi(routes.updateNoticiero, handlers.update)
    .openapi(routes.getLatestNoticiero, handlers.getLatestNoticiero)
    .openapi(routes.getByID, handlers.getByID)
    .openapi(routes.create, handlers.create)
    .openapi(routes.getLatestDraft, handlers.getLatestDraft)


export default router;