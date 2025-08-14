import { Noticia } from "@/Models/Noticia";
import { RSSSource as RSSChannel } from "@/Models/RSSSource";
import { XMLParser } from "fast-xml-parser";

export const getNewsFromRSSSources = async (chanels: RSSChannel[]): Promise<Noticia[]> => {
    const noticiasPromises = chanels
        .map(async (chanel: RSSChannel) => await getRssRaw(chanel.rssUrl))
        .map(async (xmlString) => await extractNewsFromRss(await (xmlString)))
    return filterNews((await Promise.all(noticiasPromises)).flat());
}

const getRssRaw = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error obteniendo feed RSS ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error al leer feed RSS ${url}:`, error);
        throw new Error(`No se pudieron obtener noticias del feed: ${url}`);
    }
}

const extractNewsFromRss = async (xmlString: string): Promise<Noticia[]> => {
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
            return {
                title: item.title || "",
                categories: item.category || [],
                publicationDate: item.pubDate,
                content: clearContent || "",
                source: feedContent.title || ""
            }
        });
        return (await Promise.all(noticiasPromises)).flat();
    } catch (error) {
        console.error("Error parsing XML:", error);
        throw error;
    }
}

const filterNews = (noticias: Noticia[]): Noticia[] => {
    const today = new Date();
    const millisForSevenDays = 7 * 24 * 60 * 60 * 1000;
    return noticias
        .filter((noticia) => {
            noticia.publicationDate.getTime() <= (today.getTime() - millisForSevenDays)
        })
}