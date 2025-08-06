import { Fuente } from "../../domain/entities/Fuente";
import { IReadFuente } from "../../domain/interfaces/IReadFuente";

export class GetAllFuentes {
    constructor(private readonly readFuente: IReadFuente) { }

    async execute(): Promise<Fuente[]> {
        return this.readFuente.findAll();
    }
}