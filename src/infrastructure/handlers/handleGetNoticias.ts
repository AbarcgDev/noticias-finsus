import { GetNoticiasFromRss } from "../../application/use-cases/GetNoticiasFromRss";
import { Noticia } from "../../domain/entities/Noticia";
import { FeedParserGateway } from "../gateways/FeedParserGateway";
import { HttpRssFeedGateway } from "../gateways/HttpRssFeedGateway";
import { FuentesRepositoryD1 } from "../repositories/FuentesRepositoryD1";
import { Context } from "hono";
import NoticiaSchema from "../schemas/noticiaSchema";
import { NoticiasCensorGateway } from "../gateways/NoticiasCensorGateway";

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