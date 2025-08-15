import { Noticia } from "@/Data/Models/Noticia";
import { XMLParser } from "fast-xml-parser";
import { cleanHtmlWithRewriter } from "../Trasformations/CleanHtml";

export const getRssRaw = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error obteniendo feed RSS ${response.statusText}`);
    }
    return await response.text();
}

export const extractNewsFromRss = async (xmlString: string): Promise<Noticia[]> => {
    const parser = new XMLParser({
        tagValueProcessor: (tagName, tagValue) => {
            if (typeof tagValue === 'string' && tagValue.startsWith('<![CDATA[')) {
                return tagValue.slice(9, -3).trim();
            }
            return tagValue;
        }
    });

    const feedContent = parser.parse(xmlString);
    const items = feedContent.rss?.channel?.item || [];

    const newsPromises = items.map(async (item: any) => {
        return {
            title: item.title || "",
            categories: item.category || [],
            publicationDate: new Date(item.pubDate),
            content: await cleanHtmlWithRewriter(item["content:encoded"]),
            source: feedContent.rss?.channel?.title || ""
        };
    });

    return Promise.all(newsPromises);
}
