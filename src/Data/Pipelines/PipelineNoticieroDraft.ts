import { IRSSChanelRepository } from "@/Infrastructure/RssChanelD1Repository"
import { pipelineNoticias } from "./PipelineNoticias"
import { generateGuionWithAI } from "@/Processes/Extract/GenerateGuionWithAI"
import { Noticiero } from "@/domain/noticieros/Noticiero"
import { v4 as v4UUID } from "uuid"

export const pipelineNoticieroDraft = async (rssRepository: IRSSChanelRepository, geminiAPIKey: string) => {
  const fuentes = await rssRepository.findAll()
  const noticias = await pipelineNoticias(fuentes)
  const guion = await generateGuionWithAI(noticias, geminiAPIKey)
  const noticiero: Noticiero = {
    id: v4UUID(),
    title: "Noticiero Finsus - " + new Date().toLocaleDateString("es-MX")
    guion: guion
  }
}
