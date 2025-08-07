import { Noticia } from "../../domain/entities/Noticia";

export interface IParseNoticiasFromXml {
    parse(xmlString: string): Promise<Noticia[]>;
}