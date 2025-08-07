import { Context } from "hono";
import { FuentesRepositoryD1 } from "../infrastructure/repositories/FuentesRepositoryD1";
import { GetAllFuentes } from "../application/use-cases/GetAllFuentes";
import { Fuente } from "../domain/entities/Fuente";


export const handleGetAllFuentesReq = async (c: Context) => {
  const repo = new FuentesRepositoryD1(c.env.DB);
  const useCase = new GetAllFuentes(repo);
  const fuentes = await useCase.execute();
  console.info(fuentes);

  return c.json(fuentes.map((fuente: Fuente) => ({
    id: fuente.id,
    name: fuente.name,
    rssUrl: fuente.rssUrl,
    active: fuente.active,
    createdAt: fuente.createdAt.toISOString(),
    updatedAt: fuente.updatedAt.toISOString(),
  })), { status: 200 });

}
