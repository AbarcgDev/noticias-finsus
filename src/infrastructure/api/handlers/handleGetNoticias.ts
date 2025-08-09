import { GetNoticiasFromRss } from "../../../application/use-cases/GetNoticiasFromRss";
import { Noticia } from "../../../domain/NoticiaContext/Noticia";
import { FeedParserGateway } from "@/infrastructure/services/RssFeedParser";
import { HttpRssFeedGateway } from "@/infrastructure/services/HttpRssFeed";
import { FuentesRepositoryD1 } from "@/infrastructure/persistence/FuentesRepositoryD1";
import { Context } from "hono";
import { NoticiasCensorGateway } from "@/infrastructure/services/NoticiasCensor";

export const handleGetNoticiasReq = async (c: Context) => {
    try {
        const useCase = new GetNoticiasFromRss(
            new FuentesRepositoryD1(c.env.DB),
            new HttpRssFeedGateway(),
            new FeedParserGateway(),
            new NoticiasCensorGateway(),
        );

        const noticias = await useCase.execute();
        return c.json(noticias.map((noticia: Noticia) => ({
            id: noticia.id,
            title: noticia.title,
            categories: noticia.categories,
            content: noticia.content,
            publicationDate: noticia.publicationDate,
            source: noticia.source
        })), { status: 200 });
    } catch (error) {
        console.error("Error al obtener las noticias:", error);
        throw new Error("Error al obtener las noticias");
    }
}
