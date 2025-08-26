import { ApiRouteHandler } from "@/lib/types";
import { GetCensorListRoute } from "./censorList.routes";
import { LatestNoticieroKVRepository } from "@/Infrastructure/LatestNoticieroKVRepository";
import { Context } from "hono";

export const list: ApiRouteHandler<GetCensorListRoute> = async (c: Context) => {
    const repo = new LatestNoticieroKVRepository(c.env.LATEST_NOTICIERO_ST);
    const list = await repo.getCensorList()
    if (!list) {
        return c.json({
            message: "No se encontró una lista de censura",
        }, 404)
    }
    return c.json({
        list
    }, 200)
}