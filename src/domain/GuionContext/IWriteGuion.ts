import { Guion } from "./Guion";

export interface IWriteGuion {
    saveGuion(guion: Guion): Promise<Guion>;
    updateGuion(guion: Guion): Promise<Guion>;
    deleteGuion(id: string): Promise<void>;
}