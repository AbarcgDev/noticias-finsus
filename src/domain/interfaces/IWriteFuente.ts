import { Fuente } from "../entities/Fuente";

export interface IWriteFuente {
    create(fuente: Fuente): Promise<Fuente>;
    update(fuente: Fuente): Promise<Fuente>;
    delete(id: string): Promise<void>;
}