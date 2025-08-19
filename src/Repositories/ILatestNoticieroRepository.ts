import { Noticiero } from "@/Data/Models/Noticiero";

export interface ILatestNoticieroRepository {
    findLatest(): Promise<Noticiero | null>
    insertLatest(noticiero: Noticiero): Promise<void>
}