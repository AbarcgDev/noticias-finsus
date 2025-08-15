import { Noticiero } from "@/Data/Models/Noticiero";

export interface INoticierosRepository {
    findAll(): Promise<Noticiero[]>
    findById(id: string): Promise<Noticiero | null>
    save(noticiero: Noticiero): Promise<void>
}