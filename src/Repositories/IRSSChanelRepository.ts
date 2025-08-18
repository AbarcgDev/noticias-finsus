import { RSSChannel } from "@/Data/Models/RSSChanel";

export interface IRSSChanelRepository {
  findAll(): Promise<RSSChannel[]>
}
