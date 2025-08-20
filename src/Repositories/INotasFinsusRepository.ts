import { NotaFinsus } from "@/Data/Models/NotasFinsus";

export interface INotasFinsusRepository {
    getRecents(): Promise<NotaFinsus[]>
}