import { Noticia } from "../NoticiaContext/Noticia";

export interface IWriteNoticia {
    createNoticia(noticia: Noticia): Promise<Noticia>;
}