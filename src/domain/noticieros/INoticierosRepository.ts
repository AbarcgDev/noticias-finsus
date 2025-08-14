import { Noticiero } from "./Noticiero";

export interface INoticierosRepository {
    getNoticieroById(id: string): Promise<Noticiero>;
    listNoticieros(): Promise<Noticiero[]>;
    createNoticiero(noticiero: Noticiero): Promise<Noticiero>;
    updateNoticiero(noticiero: Noticiero): Promise<Noticiero>;
    deleteNoticiero(id: string): Promise<Noticiero>;
}