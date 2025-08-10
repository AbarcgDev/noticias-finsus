import { IGuionAIGeneration } from "@/domain/GuionContext/IGuionIAGeneration";
import { GoogleGenAI } from "@google/genai"


class GeminiAIService implements IGuionAIGeneration {
  constructor(private readonly gemini = new GoogleGenAI({})) { }


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
  i
}
