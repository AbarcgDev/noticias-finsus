import { XMLParser } from "fast-xml-parser"
import { Noticia } from "../../domain/NoticiaContext/Noticia";
import { IParseNoticiasFromXml } from "../../domain/NoticiaContext/IParseNoticiasFromXml.ts";

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
            const noticiasPromises: Noticia[] = feedContent.rss.channel.item.map(async (item: any) => {
                const htmlContent = new Response(item["content:encoded"], {
                    headers: { 'Content-Type': 'text/html' }
                });
                let clearContent = "";
                const htmlRewriter = new HTMLRewriter()
                    .on("*", {
                        text: (text) => {
                            clearContent += text.text.trim();
                        }
                    });
                await htmlRewriter.transform(htmlContent).text();
                return Noticia.fromObject({
                    title: item.title || "",
                    categories: item.category || [],
                    publicationDate: item.pubDate,
                    content: clearContent || "",
                    source: feedContent.title || ""
                });
            });
            return (await Promise.all(noticiasPromises)).flat();
        } catch (error) {
            console.error("Error parsing XML:", error);
            throw error;
        }
    }
}