import { Noticia } from "./Noticia";

export interface ICensorNoticia {
    censor(noticia: Noticia): Boolean;
}