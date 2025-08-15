import { Noticiero } from "@/Data/Models/Noticiero";
import { INoticierosRepository } from "@/Repositories/INoticierosRepositrory";
import { raw } from "hono/html";

export class NoticierosD1Repository implements INoticierosRepository {
    constructor(private readonly db: D1Database) { }

    async findById(id: string): Promise<Noticiero | null> {
        const query = this.db.prepare("SELECT * FROM noticieros WHERE id = ?");
        const result: Noticiero | null = await query.bind(id).first()
        if (!result) {
            return Promise.resolve(null);
        }
        return {
            id: result.id,
            title: result.title,
            guion: result.guion,
            publicationDate: result.publicationDate
        } as Noticiero;
    }

    async findAll(): Promise<Noticiero[]> {
        const { results } = await this.db.prepare("SELECT * FROM noticieros").all()
        let resolution: Noticiero[] = [];
        if (results) {
            const resolution = results.map((row: any) => {
                return {
                    id: row.id,
                    title: row.title,
                    guion: row.guion,
                    state: row.state,
                    publicationDate: row.publicationDate
                }
            }
            );
        }
        return Promise.resolve(resolution);
    }

    async save(noticiero: Noticiero): Promise<void> {
        const query = this.db.prepare(`
            INSERT INTO noticieros (
            id, 
            title, 
            guion,  
            publication_date) 
            VALUES
            (?, ?, ?, ?);
            `);
        await query.bind(
            noticiero.id,
            noticiero.title,
            noticiero.guion,
            noticiero.publicationDate.toISOString()
        ).run();
    }

    delete(id: string): Promise<Noticiero> {
        throw new Error("Method not implemented.");
    }
}
