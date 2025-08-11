import { Guion } from "@/domain/GuionContext/Guion";
import { IWriteGuion } from "@/domain/GuionContext/IWriteGuion";


export class SaveGuion {
    constructor(
        private readonly repository: IWriteGuion,
    ) { }

    execute(guion: Guion) {
        this.repository.saveGuion(guion);
    }
}