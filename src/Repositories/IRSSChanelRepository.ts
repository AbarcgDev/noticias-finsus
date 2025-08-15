import { RSSChannel } from "@/Models/RSSChanel";

export interface IRSSChanelRepository {
  findAll(): Promise<RSSChannel[]>
}
