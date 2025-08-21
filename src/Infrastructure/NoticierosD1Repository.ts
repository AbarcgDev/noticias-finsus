import { Noticiero } from "../Data/Models/Noticiero";
import { INoticierosRepository } from "../Repositories/INoticierosRepositrory";
import { raw } from "hono/html";

export class NoticierosD1Repository implements INoticierosRepository {
    constructor(private readonly db: D1Database) { }

    async findById(id: string): Promise<Noticiero | null> {
        const query = this.db.prepare("SELECT * FROM noticieros WHERE id = ?");
        const result: any = await query.bind(id).first();

        if (!result) {
            return null;
        }

        const noticiero: Noticiero = {
            id: result.id,
            title: result.title,
            guion: result.guion,
            state: result.state,
            publicationDate: new Date(result.publicationDate),
            approvedBy: result.approvedBy,
        };

        // Liberar el stub devuelto por D1
        result.dispose?.();

        return noticiero;
    }


    async findAll(): Promise<Noticiero[]> {
        const { results }: any = await this.db.prepare("SELECT * FROM noticieros").all();

        if (!results) return [];

        const resolution: Noticiero[] = results.map((row: any) => ({
            id: row.id,
            title: row.title,
            guion: row.guion,
            state: row.state,
            publicationDate: new Date(row.publicationDate),
            approvedBy: row.approvedBy
        } as Noticiero));

        // Muy importante: liberar el stub del .all()
        results.dispose?.();

        return resolution;
    }


    async save(noticiero: Noticiero): Promise<void> {
        try {
            const query = this.db.prepare(`
            INSERT INTO noticieros (
            id, 
            title,
            guion,
            state,
            approvedBy,  
            publicationDate) 
            VALUES
            (?, ?, ?, ?, ?, ?);
            `);
            await query.bind(
                noticiero.id,
                noticiero.title,
                noticiero.guion,
                noticiero.state,
                noticiero.approvedBy,
                noticiero.publicationDate.toISOString()
            ).run();
        } catch (e: any) {
            console.error("Error insertando noticiero en base de datos: " + e);
        }
    }

    delete(id: string): Promise<Noticiero> {
        throw new Error("Method not implemented.");
    }

    dispose() {
        (this.db as any).dispose();
    }
}
