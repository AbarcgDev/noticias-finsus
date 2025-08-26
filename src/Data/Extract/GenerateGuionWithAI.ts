
import { guionNoticiero } from "@/AIPrompts.json"
import { GoogleGenAI } from "@google/genai";
import { Noticia } from "../Models/Noticia";
import { NotaFinsus } from "../Models/NotasFinsus";

export const generateGuionWithAI = async (noticias: Noticia[], notasFinus: NotaFinsus[], apiKey: string): Promise<string> => {
    const guionContent = callTextGenerationService(generatePrompt(noticias, notasFinus), apiKey);
    return guionContent
}

const generatePrompt = (noticias: Noticia[], notasFinsus: NotaFinsus[]): string => {
    const prompt = [
        guionNoticiero.context.join("\n"),
        guionNoticiero.instruction.join("\n"),
        noticias.map((n: Noticia) => {
            return `
          TITULO: ${n.title}
          CONTENIDO: ${n.content}
          FUENTE: ${n.source}
        `
        }
        ).join("\n\n"),
        notasFinsus.map((nota: NotaFinsus) => {
            return `
            ETIQUETA: NOTA FINSUS,
            TITULO: ${nota.title},
            CONTENIDO ${nota.description},
            `
        }).join("\n\n")
    ].join("\n\n")
    return prompt;
}

const callTextGenerationService = async (prompt: string, apiKey: string): Promise<string> => {
    const gemini: GoogleGenAI = new GoogleGenAI({ apiKey: apiKey })
    const maxRetries = 3;
    let attempts = 0;
    while (attempts < maxRetries) {
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
            attempts++;
            if (attempts >= maxRetries) {
                throw new Error("Fallo en la generacion de texto por IA")
            }
        }
    }
    return "";
}
