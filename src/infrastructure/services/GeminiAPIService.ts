import { IAudioFileGenerator, WavBuffer } from "@/application/IAudioFileGenerator";
import { IGuionAIGeneration } from "@/domain/GuionContext/IGuionIAGeneration";
import { GenerateContentResponse, GoogleGenAI } from "@google/genai"


export class GeminiAIService implements IGuionAIGeneration, IAudioFileGenerator {
  private readonly gemini: GoogleGenAI;
  constructor(apiKey: string) {
    this.gemini = new GoogleGenAI({ apiKey: apiKey });
  }
  async generateAudio(instruction: string, content: string): Promise<WavBuffer> {
    try {
      const response = await this.callTTSGenerationModel(instruction, content)
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) {
        throw new Error("No se recibieron datos de audio");
      }
      const audioBytes: WavBuffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      const wavData: WavBuffer = this.createWavBuffer(audioBytes);
      return wavData;
    } catch (e) {
      console.error("Error generando audio: ", e);
      throw new Error("No se pudo generar audio");
    }

  }


  generateGuionContent(prompt: string): Promise<string> {
    return this.callTextGenerationService(prompt);
  }

  private async callTextGenerationService(prompt: string): Promise<string> {
    try {
      const model = "gemini-2.5-flash"
      console.info("Generando texto con Gemini, modelo: ", model)
      const response = await this.gemini.models.generateContent({
        model: model,
        contents: prompt
      })
      const result = response.text
      if (!result) {
        throw new Error("El modelo no devolvio texto valido")
      }
      return result;
    }
    catch (e) {
      console.error("Error generando texto: ", e)
      throw new Error("Fallo en la generacion de texto por IA")
    }
  }

  private async callTTSGenerationModel(instruction: string, content: string): Promise<GenerateContentResponse> {
    const response: GenerateContentResponse = await this.gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: instruction + "\n" + content, }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'FIN',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Charon' }
                }
              },
              {
                speaker: 'SUS',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Leda' }
                }
              }
            ]
          }
        }
      }
    })
    console.info(response);
    return response;
  }

  private createWavBuffer(pcmData: WavBuffer, channels = 1, rate = 24000, sampleWidth = 2): WavBuffer {
    const dataLength: number = pcmData.length;
    const buffer: ArrayBuffer = new ArrayBuffer(44 + dataLength);
    const view: DataView = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // Escribir el encabezado del archivo WAV (RIFF header)
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true); // Tamaño del archivo
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Tamaño del subchunk
    view.setUint16(20, 1, true); // AudioFormat 1 = PCM
    view.setUint16(22, channels, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * channels * sampleWidth, true);
    view.setUint16(32, channels * sampleWidth, true);
    view.setUint16(34, sampleWidth * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Copiar los datos de audio en el buffer combinado
    const combinedBuffer = new Uint8Array(buffer);
    combinedBuffer.set(pcmData, 44);

    return combinedBuffer;
  }
}
