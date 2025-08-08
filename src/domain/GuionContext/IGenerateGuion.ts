import { Noticia } from "../NoticiaContext/Noticia";
import { Guion } from "./Guion";

export interface IGenerateGuion {
    generateGuion(noticias: Noticia[]): Promise<Guion>;
} 