import { Fuente } from "../../domain/FuenteContext/Fuente";
import { IReadFuente } from "../../domain/FuenteContext/IReadFuente";

export class GetFuenteById {
    constructor(private readonly fuenteRepository: IReadFuente) { }

    async execute(id: string): Promise<Fuente | null> {
        if (!id) {
            throw new Error("Id no puede ser nulo o indefinido");
        }
        return this.fuenteRepository.findById(id);
    }
}