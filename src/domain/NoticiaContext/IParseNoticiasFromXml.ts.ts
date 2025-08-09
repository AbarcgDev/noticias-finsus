import { Noticia } from "../../domain/NoticiaContext/Noticia";

export interface IParseNoticiasFromXml {
    parse(xmlString: string): Promise<Noticia[]>;
}