import { ApiRouteHandler } from "../../../../lib/types";
import { Context } from "hono";
import { ListFuentesRoute } from "./fuentes.routes";
import { RSSChanelRepository } from "../../../../Infrastructure/RssChanelD1Repository";
import { RSSChannel } from "../../../../Data/Models/RSSChanel";

export const list: ApiRouteHandler<ListFuentesRoute> = async (c: Context) => {
  try {
    console.info("Accediendo a todas las fuentes:");
    const repo = new RSSChanelRepository(c.env.DB);
    const chanels = await repo.findAll()
    return c.json(chanels.map((chanel: RSSChannel) => ({
      id: chanel.id,
      name: chanel.name,
      rssUrl: chanel.rssUrl,
      active: chanel.active,
    })), { status: 200 });
  }
  catch (error) {
    console.error("Error al obtener las fuentes:", error);
    throw new Error("Error al obtener las fuentes");
  }
};
