import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { GetAllFuentes } from "@/application/useCases/GetAllFuentes";
import { Fuente } from "@/domain/FuenteContext/Fuente";
import { ListFuentesRoute } from "./fuentes.routes";
import { FuentesRepositoryD1 } from "@/infrastructure/persistence/FuentesRepositoryD1";

export const list: ApiRouteHandler<ListFuentesRoute> = async (c: Context) => {
  try {
    console.info("Accediendo a todas las fuentes:");
    const repo = new FuentesRepositoryD1(c.env.DB);
    const useCase = new GetAllFuentes(repo);
    const fuentes = await useCase.execute();
    return c.json(fuentes.map((fuente: Fuente) => ({
      id: fuente.id,
      name: fuente.name,
      rssUrl: fuente.rssUrl,
      active: fuente.active,
      createdAt: fuente.createdAt.toISOString(),
      updatedAt: fuente.updatedAt.toISOString(),
    })), { status: 200 });
  }
  catch (error) {
    console.error("Error al obtener las fuentes:", error);
    throw new Error("Error al obtener las fuentes");
  }
};
