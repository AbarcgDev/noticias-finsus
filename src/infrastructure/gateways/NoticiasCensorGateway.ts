import { ICensorNoticia } from "../../application/interfaces/ICensorNoticia";
import { Noticia } from "../../domain/entities/Noticia";

export class NoticiasCensorGateway implements ICensorNoticia {
    censor(noticia: Noticia): Boolean {
        const forbiddenKeywords = [
            "politica",
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