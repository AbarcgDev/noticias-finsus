import { ICensorNoticia } from "../../domain/NoticiaContext/ICensorNoticia";
import { Noticia } from "../../domain/NoticiaContext/Noticia";

export class NoticiasCensorGateway implements ICensorNoticia {
    censor(noticia: Noticia): Boolean {
        const forbiddenKeywords = [
            "política",
            "violencia",
            "discriminación",
            "sheinbaum",
            "amlo",
            "corrupción",
            "trump",
            "andres manuel lópez obrador",
        ];
        return forbiddenKeywords.some(keyword => noticia.content.toLowerCase().includes(keyword));
    }
}