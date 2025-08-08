import { Noticia } from "../../domain/entities/Noticia";
import { IReadFuente } from "../../domain/interfaces/IReadFuente";
import { IWriteNoticia } from "../../domain/interfaces/IWriteNoticia";
import { IParseNoticiasFromXml } from "../interfaces/IParseNoticiasFromXml.ts";
import { IReadRssFeed } from "../interfaces/IReadRssFeed";

export class GetNoticiasFromRss {
    constructor(
        private readonly readFuente: IReadFuente,
        private readonly readRssFeed: IReadRssFeed,
        private readonly rssfeedParser: IParseNoticiasFromXml,
    ) { }

    async execute(): Promise<Noticia[]> {
        try {
            const fuentes = await this.readFuente.findAll();
            const promesasNoticias = fuentes.map(async fuente => {
                console.info(`Obteniendo noticias de la fuente: ${fuente.name}`);
                const xmlString = await this.readRssFeed.readRssFromUrl(fuente.rssUrl);
                const parsedNoticias = await this.rssfeedParser.parse(xmlString);
                return parsedNoticias.map(noticia => ({ ...noticia, source: fuente.name }));
            });
            const todasLasNoticias = await Promise.all(promesasNoticias);
            return todasLasNoticias.flat();
        }
        catch (error) {
            console.error("Error al obtener noticias desde RSS:", error);
            throw new Error("Error al obtener noticias desde RSS");
        }
    }
}