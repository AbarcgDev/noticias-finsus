import { RSSChannel } from "../Data/Models/RSSChanel";
import { IRSSChanelRepository } from "../Repositories/IRSSChanelRepository";

export class RSSChanelRepository implements IRSSChanelRepository {
  constructor(private readonly db: D1Database) { }

  public async findAll(): Promise<RSSChannel[]> {
    const { results } = await this.db.prepare("SELECT * FROM rss_chanels").all();
    let resolution: RSSChannel[] = [];
    if (results) {
      resolution = results.map((row: any) => {
        return {
          id: row.id,
          name: row.name,
          rssUrl: row.rssUrl,
          active: row.active === 1,
        }
      });
    }
    return Promise.resolve(resolution);
  }

  async findById(id: string): Promise<RSSChannel | null> {
    const result: RSSChannel | null = await this.db.prepare("SELECT * FROM rss_chanels WHERE id = ?")
      .bind(id).first();
    if (!result) {
      return Promise.resolve(null);
    }
    return result;
  }

  async save(chanel: RSSChannel): Promise<void> {
    const query = this.db.prepare(`
      INSERT INTO rss_chanels
      (
        id,
        name,
        rssUrl,
        active,
      )
      VALUES (?,?,?,?)
    `)
    await query.bind(chanel.id, chanel.name, chanel.rssUrl, chanel.active).run()
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare("DELETE * FROM rss_chanels WHERE id = ?").bind(id).run()
  }
}
