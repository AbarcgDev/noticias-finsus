import { IReadRssFeed } from "../../application/interfaces/IReadRssFeed";

export class HttpRssFeedGateway implements IReadRssFeed {
    async readRssFromUrl(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error obteniendo solicitando feed ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch RSS feed from ${url}:`, error);
            throw error;
        }
    }
}