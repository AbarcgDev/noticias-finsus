import { Fuente } from "../FuenteContext/Fuente";

export interface IReadFuente {
    findById(id: string): Promise<Fuente | null>;
    findAll(): Promise<Fuente[]>;
}
