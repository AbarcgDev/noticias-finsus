import { Fuente } from "../../domain/FuenteContext/Fuente";
import { IReadFuente } from "../../domain/FuenteContext/IReadFuente";
import { IWriteFuente } from "../../domain/FuenteContext/IWriteFuente";

export class FuentesRepositoryD1 implements IWriteFuente, IReadFuente {
    constructor(private readonly db: any) { }

    async findById(id: string): Promise<Fuente | null> {
        const result = this.db.prepare("SELECT * FROM fuentes WHERE id = ?")
            .bind(id).first();
        if (!result) {
            return Promise.resolve(null);
        }
        return Promise.resolve(Fuente.fromObject(result));
    }

    async findAll(): Promise<Fuente[]> {
        const { results } = await this.db.prepare("SELECT * FROM fuentes").all();
        let resolution: Fuente[] = [];
        if (results) {
            resolution = results.map((row: any) => Fuente.fromObject(
                {
                    id: row.id,
                    name: row.name,
                    rssUrl: row.rss_url,
                    active: row.active === 1,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }));
        }
        return Promise.resolve(resolution);
    }

    async create(fuente: Fuente): Promise<Fuente> {
        throw new Error("Method not implemented.");
    }

    async update(fuente: Fuente): Promise<Fuente> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
