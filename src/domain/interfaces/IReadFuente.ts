import { Fuente } from "../entities/Fuente";

export interface IReadFuente {
    findById(id: string): Promise<Fuente | null>;
    findAll(): Promise<Fuente[]>;
}
