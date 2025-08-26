import { generateAudioWithAI } from "../Extract/GenerateAudioWithAI"
import { audioNoticiero } from "@/AIPrompts.json"
import { Noticiero } from "../Models/Noticiero"
import { transformBase64ToWAV, WavBuffer } from "../Trasformations/TransformAIResponseToWAV"
import { IAudioRepository } from "../../Repositories/IAudioRepository"
import { transformWavToMp3 } from "../Trasformations/TransformWAVToMP3"


/// Crea y almacena archivos de audio
export const pipelineAudio = async (
  noticiero: Noticiero,
  apiKey: string,
  audioRepository: IAudioRepository
): Promise<void> => {
  console.info("Generando audio con Gemini");
  let wavBuffer = null;
  let mp3Buffer = null;
  let base64Data = null;
  try {
    const aiResponse = await generateAudioWithAI(
      audioNoticiero.instruction.join("\n"),
      noticiero.guion,
      apiKey
    )
    if (!aiResponse) {
      throw new Error("No se recibió respuesta de Gemini TTS");
    }
    base64Data = aiResponse.candidates?.[0]?.content?.parts?.[0].inlineData?.data;
    if (!base64Data) {
      throw new Error("No se recibió información de audio desde Gemini TTS");
    }
    wavBuffer = transformBase64ToWAV(base64Data);
    await audioRepository.uploadAudioWAV(noticiero.id, wavBuffer);
    console.info(("Audio WAV almacenado correctamente con id: " + noticiero.id));
    mp3Buffer = await transformWavToMp3(new Int16Array(wavBuffer.buffer));
    await audioRepository.uploadAudioMp3(noticiero.id, mp3Buffer);
    console.info(("Audio MP3 almacenado correctamente con id: " + noticiero.id));
  }
  catch (e) {
    console.error("Error generando audio: " + e)
  } finally {
    if (wavBuffer) {
      wavBuffer.fill?.(0); // Limpiar contenido si es posible
      wavBuffer = null;
    }

    if (mp3Buffer) {
      mp3Buffer.fill?.(0); // Limpiar contenido si es posible  
      mp3Buffer = null;
    }

    if (base64Data) {
      base64Data = null;
    }
  }
}
