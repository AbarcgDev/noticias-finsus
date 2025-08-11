import { Guion } from "./Guion";

export interface IReadGuion {
    getGuionById(id: string): Promise<Guion>;
    listGuiones(): Promise<Guion[]>;
}