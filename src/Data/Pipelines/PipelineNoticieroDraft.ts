
import { pipelineNoticias } from "./PipelineNoticias"
import { IRSSChanelRepository } from "../../Repositories/IRSSChanelRepository"
import { v4 as v4UUID } from "uuid"
import { generateGuionWithAI } from "../Extract/GenerateGuionWithAI"
import { Noticiero } from "../Models/Noticiero"
import { NoticieroState } from "../Models/NoticieroState"
import { INoticierosRepository } from "../../Repositories/INoticierosRepositrory"
import { getNotasFinsus } from "../Extract/GetNotasFinsus"
import { INotasFinsusRepository } from "@/Repositories/INotasFinsusRepository"

export const pipelineNoticieroDraft = async (
  rssRepository: IRSSChanelRepository,
  noticeroRepository: INoticierosRepository,
  notasFinsusRepo: INotasFinsusRepository,
  geminiAPIKey: string,
) => {
  const fuentes = await rssRepository.findAll()
  const noticias = await pipelineNoticias(fuentes)
  const notasFinsus = await getNotasFinsus(notasFinsusRepo);
  const guion = await generateGuionWithAI(noticias, notasFinsus, geminiAPIKey)
  const noticiero: Noticiero = {
    id: v4UUID(),
    title: "Noticiero Finsus - " + new Date().toLocaleDateString("es-MX"),
    guion: guion,
    state: NoticieroState.DRAFTED,
    approvedBy: "Pendiente",
    publicationDate: new Date()
  }
  console.info("Almacenando Borrador");
  await noticeroRepository.save(noticiero);
  console.info("Se creó borrador de noticiero con id: " + noticiero.id)
}
