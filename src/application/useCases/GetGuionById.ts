import { Guion } from "@/domain/GuionContext/Guion";
import { IReadGuion } from "@/domain/GuionContext/IReadGuion";

export class GetGuionById {
    constructor(
        private readonly repository: IReadGuion
    ) { }

    execute(id: string): Promise<Guion> {
        return this.repository.getGuionById(id);
    }
}