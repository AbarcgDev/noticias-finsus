import { Noticia } from "@/Models/Noticia";

import { guionNoticiero } from "@/AIPrompts.json"
import { GoogleGenAI } from "@google/genai";

const generateGuionWithAI = async (noticias: Noticia[], apiKey: string): Promise<string> => {
    const guionContent = callTextGenerationService(generatePrompt(noticias), apiKey);
    return guionContent
}

const generatePrompt = (noticias: Noticia[]): string => {
    const prompt = [
        guionNoticiero.context.join("\n"),
        guionNoticiero.instruction.join("\n"),
        noticias.map((n: Noticia) => {
            return `
          TITULO: ${n.title}
          CONTENIDO: ${n.content}
          FUENTE: ${n.source}
        `
        }).join("\n\n")
    ].join("\n\n")
    return prompt;
}

const callTextGenerationService = async (prompt: string, apiKey: string): Promise<string> => {
    const gemini: GoogleGenAI = new GoogleGenAI({ apiKey: apiKey })
    try {
        const model = "gemini-2.5-flash"
        console.info("Generando texto con Gemini, modelo: ", model)
        const response = await gemini.models.generateContent({
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
