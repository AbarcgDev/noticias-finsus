import { INotasFinsusRepository } from "@/Repositories/INotasFinsusRepository";
import { NotaFinsus } from "../Models/NotasFinsus";

export const getNotasFinsus = async (notasFinsusRepo: INotasFinsusRepository): Promise<NotaFinsus[]> => {
    const notas = notasFinsusRepo.getRecents();
    return notas;
}