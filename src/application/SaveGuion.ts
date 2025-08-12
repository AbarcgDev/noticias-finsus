import { Guion } from "@/domain/GuionContext/Guion";
import { IWriteGuion } from "@/domain/GuionContext/IWriteGuion";


export class SaveGuion {
    constructor(
        private readonly repository: IWriteGuion,
    ) { }

    async save(guion: Guion): Promise<Guion> {
        const result = await this.repository.saveGuion(guion);
        return result;
    }

    async update(guion: Guion): Promise<Guion> {
        const result = await this.repository.updateGuion(guion);
        return result;
    }
}