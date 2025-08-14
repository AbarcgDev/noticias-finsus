import { Guion } from "@/domain/GuionContext/Guion";
import { IWriteGuion } from "@/domain/GuionContext/IWriteGuion";


export class SaveGuion {
    constructor(
        private readonly repository: IWriteGuion,
    ) { }

    async execute(guion: Guion): Promise<Guion> {
        return this.repository.saveGuion(guion);
    }
}
