import { Fuente } from "../../domain/FuenteContext/Fuente";
import { IReadFuente } from "../../domain/FuenteContext/IReadFuente";

export class GetAllFuentes {
    constructor(private readonly readFuente: IReadFuente) { }

    async execute(): Promise<Fuente[]> {
        return this.readFuente.findAll();
    }
}