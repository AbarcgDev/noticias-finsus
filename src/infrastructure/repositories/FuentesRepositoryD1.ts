import { Fuente } from "../../domain/entities/Fuente";
import { IReadFuente } from "../../domain/interfaces/IReadFuente";
import { IWriteFuente } from "../../domain/interfaces/IWriteFuente";

export class FuentesRepositoryD1 implements IWriteFuente, IReadFuente {
    constructor(private readonly db: any) { }
    findById(id: string): Promise<Fuente | null> {
        const result = this.db.prepare("SELECT * FROM fuentes WHERE id = ?")
            .bind(id).first();
        if (!result) {
            return Promise.resolve(null);
        }
        return Promise.resolve(Fuente.fromObject(result));
    }
    findAll(): Promise<Fuente[]> {
        const { results } = this.db.prepare("SELECT * FROM fuentes").all();
        let resolution: Fuente[] = [];
        if (results) {
            resolution = results.map((row: Object) => Fuente.fromObject(row));
        }
        return Promise.resolve(resolution);
    }
    create(fuente: Fuente): Promise<Fuente> {
        throw new Error("Method not implemented.");
    }
    update(fuente: Fuente): Promise<Fuente> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}