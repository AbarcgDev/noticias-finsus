import { Noticia } from "@/Models/Noticia";
import { RSSChannel } from "@/Models/RSSChanel";
import { extractNewsFromRss, getRssRaw } from "@/Processes/Extract/GetNewsFromRss";
import { filterNews } from "@/Processes/Trasformations/FilterNews";

export const pipelineNoticias = async (channels: RSSChannel[]): Promise<Noticia[]> => {
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


