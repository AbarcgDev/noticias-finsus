import { XMLParser, XMLBuilder } from "fast-xml-parser"
import { Noticia } from "../../domain/entities/Noticia";
import { IParseNoticiasFromXml } from "../../application/interfaces/IParseNoticiasFromXml.ts";

export class FeedParserGateway implements IParseNoticiasFromXml {
    async parse(xmlString: string): Promise<Noticia[]> {
        try {
            const parser = new XMLParser();
            const feedContent = parser.parse(xmlString);
            const noticias: Noticia[] = feedContent.rss.channel.item.map((item: any) => {
                return Noticia.fromObject({
                    title: item.title || "",
                    link: item.link || "",
                    publicationDate: item.pubDate,
                    content: item["content:encoded"] || "",
                    source: feedContent.title || ""
                });
            });
            return noticias;
        } catch (error) {
            console.error("Error parsing XML:", error);
            throw error;
        }
    }
}