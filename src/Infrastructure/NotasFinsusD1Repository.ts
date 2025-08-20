import { NotaFinsus } from "@/Data/Models/NotasFinsus";
import { INotasFinsusRepository } from "@/Repositories/INotasFinsusRepository";

export class NotasFinsusD1Repository implements INotasFinsusRepository {
    constructor(private readonly db: D1Database) { }

    async getRecents(): Promise<NotaFinsus[]> {
        const query = this.db.prepare(
            `
                SELECT * 
                FROM notas_finsus 
                WHERE pubDate >= datetime('now', '-7 days');

            `
        );
        const notas = await query.all()
        return notas.results.map((nota: any) => {
            return {
                id: nota.id,
                title: nota.title,
                description: nota.description,
                pubDate: new Date(nota.pubDate),
            } as NotaFinsus
        })
    }

    dispose() {
        (this.db as any).dispose();
    }

}