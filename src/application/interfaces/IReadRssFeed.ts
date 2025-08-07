export interface IReadRssFeed {
    readRssFromUrl(url: string): Promise<string>;
}