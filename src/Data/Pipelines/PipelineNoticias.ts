import { Noticia } from "../Models/Noticia";
import { RSSChannel } from "../Models/RSSChanel";
import { filterNews } from "../Trasformations/FilterNews";
import { extractNewsFromRss, getRssRaw } from "../Extract/GetNewsFromRss";
import { INotasFinsusRepository } from "@/Repositories/INotasFinsusRepository";

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
    const filteredNews = filterNews(allNews)
    console.info(`Se descartaron ${allNews.length - filteredNews.length} noticias`)
    console.info(`Se enviarán ${filteredNews.length} noticias`)
    return filteredNews;
  } catch (error) {
    console.error("An unexpected error occurred in getNewsFromRSSSources:", error);
    return [];
  }
}


