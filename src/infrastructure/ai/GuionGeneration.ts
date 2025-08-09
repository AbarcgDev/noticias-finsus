import { Guion } from "../../domain/GuionContext/Guion";
import { IGenerateGuion } from "../../domain/GuionContext/IGenerateGuion";
import { Noticia } from "../../domain/NoticiaContext/Noticia";

export class GuionGeneration implements IGenerateGuion {
    constructor(
        private readonly aiConnection: any,
        private readonly systemMsg: string = [
            "Eres un experto redactor de guiones para noticieros con enfoque",
            "en negocios y economia. Trabajas para la empresa Finsus:",
            "En FINSUS Nuestro enfoque es ofrecer soluciones digitales innovadoras de ahorro",
            "e inversión para personas físicas y morales.",
            "Además contamos con esquemas de crédito para el financiamiento de proyectos productivos",
            "Democratizamos los servicios financieros acelerando la reasignación de capital para financiar",
            "proyectos socialmente justos: Personas y Ambiente.",
        ].join(" "),
        private readonly instruction: string = [
            "Vas a generar un guion de noticiero que dure 5 minutos",
            "El guion debe resumir la información en 5 minutos en un tono dinámico, pero objetivo y neutral. Evita frases de relleno como",
            "en este guion o esto es un guion.",
            "El formato debe ser el siguiente:\n",
            "LOCUTOR:\n",
            "SEGMENTO:\n",
            "Asegúrate de que la voz de los locutores se mantenga neutral y evite cualquier lenguaje emocional u opinativo",
            "Debe habe un locutor hombre(Carlos) y una locutora mujer(Lety)",
            "El guion debe centrarse en presentar los hechos tal como fueron dados"].join("")
    ) { };

    async generateGuion(noticias: Noticia[]): Promise<Guion> {
        try {
            const messages = {
                instructions: [this.systemMsg, this.instruction].join("\n"),
                input: noticias.map(this.formatNoticia).join("\n"),
                max_output_tokens: 1000
            }
            const result = await this.aiConnection.run("@cf/openai/gpt-oss-120b", messages);
            return Promise.resolve(
                Guion.fromObject({
                    content: result.response,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));
        }
        catch (e) {
            console.error("Error generando guion: ", e);
            throw new Error("No se pudo generar guion");
        }
    }

    private formatNoticia(noticia: Noticia): string {
        return [
            `Titulo: ${noticia.title}`,
            `Fuente: ${noticia.source}`,
            `Contenido: ${noticia.content}`
        ].join("\n")
    }
}