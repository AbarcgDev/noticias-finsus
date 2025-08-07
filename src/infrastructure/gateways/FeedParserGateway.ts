import { XMLParser } from "fast-xml-parser"
import { Noticia } from "../../domain/entities/Noticia";
import { IParseNoticiasFromXml } from "../../application/interfaces/IParseNoticiasFromXml.ts";

export class FeedParserGateway implements IParseNoticiasFromXml {
    async parse(xmlString: string): Promise<Noticia[]> {
        try {
            const parser = new XMLParser({
                tagValueProcessor: (tagName, tagValue, jPath) => {
                    // Check if the value is a string and starts with the CDATA marker
                    if (typeof tagValue === 'string' && tagValue.startsWith('<![CDATA[')) {
                        // Remove the CDATA wrappers from the beginning and end
                        return tagValue.slice(9, -3).trim();
                    }
                    // For all other tags, return the original value
                    return tagValue;
                }
            });
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