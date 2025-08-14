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
      console.info("Datos de audio recibidos: ", data);
      if (!data) {
        throw new Error("No se recibieron datos de audio");
      }
      const wavData: WavBuffer = this.createWavBuffer(data);
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
    return response;
  }


  // CREA UN BUFFER WAV A PARTIR DE UN BASE64
  private createWavBuffer(base64Data: string, channels = 1, rate = 24000, sampleWidth = 2): WavBuffer {
    const pcmData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const dataLength = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true); // file length - 8
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // format = PCM
    view.setUint16(22, channels, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * channels * sampleWidth, true); // byte rate
    view.setUint16(32, channels * sampleWidth, true); // block align
    view.setUint16(34, sampleWidth * 8, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Copiar datos PCM después del header
    const wavBytes = new Uint8Array(buffer);
    wavBytes.set(pcmData, 44);

    return wavBytes;
  }
}
