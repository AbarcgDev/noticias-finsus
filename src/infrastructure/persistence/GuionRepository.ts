import { Guion } from "@/domain/GuionContext/Guion";
import { IReadGuion } from "@/domain/GuionContext/IReadGuion";
import { IWriteGuion } from "@/domain/GuionContext/IWriteGuion";

export class GuionD1Repository implements IWriteGuion, IReadGuion {
    constructor(private readonly db: D1Database) { }

    async getGuionById(id: string): Promise<Guion> {
        try {
            const query = this.db.prepare("SELECT * FROM guiones WHERE id=?")
            const guion = await query.bind(id).first() as Guion
            if (!guion) {
                throw new Error(`No existe guion con id: ${id}`)
            }
            return Guion.fromObject({
                id: guion.id,
                title: guion.title,
                content: guion.content,
                createdAt: guion.createdAt,
                updatedAt: guion.updatedAt,
                status: guion.status
            })
        } catch (e: any) {
            console.error("Error intentando obtener recurso", e.message)
            throw new Error("Error obteniendo recurso");
        }
    }

    listGuiones(): Promise<Guion[]> {
        throw new Error("Method not implemented.");
    }

    async saveGuion(guion: Guion): Promise<Guion> {
        try {
            const query = this.db.prepare("INSERT INTO guiones (id, title, content, createdAt, updatedAt, status) VALUES (?,?,?,?,?,?)");
            const result = await query.bind(
                guion.id,
                guion.title,
                guion.content,
                guion.createdAt,
                guion.updatedAt,
                guion.status
            ).run();
            return guion;
        } catch (e) {
            console.error("Error insertando guion en DB", e)
            throw new Error(`No se pudo guardar guion en DB, id: ${guion.id}`);
        }
    }

    async updateGuion(guion: Guion): Promise<Guion> {
        try {
            const query = this.db.prepare(`
            UPDATE guiones 
            SET
                content = ?, 
                updatedAt = ?
            WHERE id = ?
        `);
            const result = await query.bind(
                guion.content,
                new Date().toISOString(),
                guion.id
            ).run();
            return guion;
        } catch (e: any) {
            console.error("Error actualizando guion en DB", e)
            throw new Error(`No se pudo actualizar guion en DB, id: ${guion.id}`);
        }
    }


    deleteGuion(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}