import { Noticia } from "../entities/Noticia";

export interface IWriteNoticia {
    createNoticia(noticia: Noticia): Promise<Noticia>;
}