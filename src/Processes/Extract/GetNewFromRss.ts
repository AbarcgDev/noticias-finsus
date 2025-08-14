import { Noticia } from "@/Models/Noticia";
import { RSSSource as RSSChannel } from "@/Models/RSSSource";
import { XMLParser } from "fast-xml-parser";


export const getNewsFromRSSSources = async (channels: RSSChannel[]): Promise<Noticia[]> => {
    try {
        const fetchPromises = channels.map(async (channel: RSSChannel) => {
            try {
                const xmlString = await getRssRaw(channel.rssUrl);
                return extractNewsFromRss(xmlString);
            } catch (error) {
                console.error(`Error processing channel ${channel.rssUrl}:`, error);
                return [];
            }
        });

        const allNews = (await Promise.all(fetchPromises)).flat();

        return filterNews(allNews);
    } catch (error) {
        console.error("An unexpected error occurred in getNewsFromRSSSources:", error);
        return [];
    }
}

const getRssRaw = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error obteniendo feed RSS ${response.statusText}`);
    }
    return await response.text();
}
const extractNewsFromRss = async (xmlString: string): Promise<Noticia[]> => {
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
        const cleanedContent = await cleanHtmlWithRewriter(item["content:encoded"] || "");

        return {
            title: item.title || "",
            categories: item.category || [],
            publicationDate: new Date(item.pubDate),
            content: cleanedContent,
            source: feedContent.rss?.channel?.title || ""
        };
    });

    return Promise.all(newsPromises);
}

const cleanHtmlWithRewriter = async (htmlContent: string): Promise<string> => {
    let clearContent = "";
    const htmlRewriter = new HTMLRewriter()
        .on("*", {
            text: (text) => {
                clearContent += text.text.trim();
            }
        });

    const response = new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' }
    });

    await htmlRewriter.transform(response).text();

    return clearContent;
}

const filterNews = (noticias: Noticia[]): Noticia[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return noticias.filter(noticia => noticia.publicationDate >= sevenDaysAgo);
}