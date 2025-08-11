import { Noticia } from "../../domain/NoticiaContext/Noticia";
import { IReadFuente } from "../../domain/FuenteContext/IReadFuente";
import { ICensorNoticia } from "../../domain/NoticiaContext/ICensorNoticia";
import { IReadRssFeed } from "../../domain/NoticiaContext/IReadRssFeed";
import { IParseNoticiasFromXml } from "../../domain/NoticiaContext/IParseNoticiasFromXml.ts";

export class GetNoticiasFromRss {
    constructor(
        private readonly readFuente: IReadFuente,
        private readonly readRssFeed: IReadRssFeed,
        private readonly rssfeedParser: IParseNoticiasFromXml,
        private readonly noticiasCensor: ICensorNoticia,
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
            const noticiasFiltradas = todasLasNoticias.flat().filter(noticia => {
                const censor = this.noticiasCensor.censor(noticia)
                if (censor) {
                    console.info(`Noticia censurada: ${noticia.title}`);
                }
                return !censor;
            });
            return noticiasFiltradas;
        }
        catch (error) {
            console.error("Error al obtener noticias desde RSS:", error);
            throw new Error("Error al obtener noticias desde RSS");
        }
    }
}
