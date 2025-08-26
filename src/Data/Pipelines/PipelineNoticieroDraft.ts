
import { pipelineNoticias } from "./PipelineNoticias"
import { IRSSChanelRepository } from "../../Repositories/IRSSChanelRepository"
import { v4 as v4UUID } from "uuid"
import { generateGuionWithAI } from "../Extract/GenerateGuionWithAI"
import { Noticiero } from "../Models/Noticiero"
import { NoticieroState } from "../Models/NoticieroState"
import { INoticierosRepository } from "../../Repositories/INoticierosRepositrory"
import { getNotasFinsus } from "../Extract/GetNotasFinsus"
import { INotasFinsusRepository } from "@/Repositories/INotasFinsusRepository"
import { ILatestNoticieroRepository } from "@/Repositories/ILatestNoticieroRepository"

import { bienvenida, despedida } from "../../AIPrompts.json"
import { NotaFinsus } from "../Models/NotasFinsus"

export const pipelineNoticieroDraft = async (
  rssRepository: IRSSChanelRepository,
  noticeroRepository: INoticierosRepository,
  notasFinsusRepo: INotasFinsusRepository,
  geminiAPIKey: string,
): Promise<Noticiero> => {
  const fuentes = await rssRepository.findAll()
  const noticias = await pipelineNoticias(fuentes)
  const notasFinsus: NotaFinsus[] = [];
  const guionAI = await generateGuionWithAI(noticias, notasFinsus, geminiAPIKey)
  const guion = [
    bienvenida.join("\n"),
    guionAI,
    despedida.join("\n")
  ].join("\n\n");
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
  return noticiero;
}
