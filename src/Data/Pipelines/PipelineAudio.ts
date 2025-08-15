import { generateAudioWithAI } from "../Extract/GenerateAudioWithAI"
import { audioNoticiero } from "@/AIPrompts.json"
import { Noticiero } from "../Models/Noticiero"
import { transformBase64ToWAV } from "../Trasformations/TransformAIResponseToWAV"
import { IAudioRepository } from "@/Repositories/IAudioRepository"
import { transformWavToMp3 } from "../Trasformations/TransformWAVToMP3"

export const pipelineAudio = async (noticiero: Noticiero, apiKey: string, audioRepository: IAudioRepository) => {
  const aiResponse = await generateAudioWithAI(
    audioNoticiero.instruction.join("\n"),
    noticiero.guion,
    apiKey
  )
  if (!aiResponse) {
    throw new Error("No se recibió respuesta de Gemini TTS");
  }
  const base64Data = aiResponse.candidates?.[0]?.content?.parts?.[0].inlineData?.data;
  if (!base64Data) {
    throw new Error("No se recibió información de audio desde Gemini TTS");
  }
  const wavBuffer = transformBase64ToWAV(base64Data);
  await audioRepository.uploadAudioWAV(noticiero.id, wavBuffer)
  console.info(("Audio WAV almacenado correctamente con id: " + noticiero.id))
  const mp3Buffer = await transformWavToMp3(wavBuffer)
  await audioRepository.uploadAudioMp3(noticiero.id, mp3Buffer)
  console.info(("Audio MP3 almacenado correctamente con id: " + noticiero.id))
}
