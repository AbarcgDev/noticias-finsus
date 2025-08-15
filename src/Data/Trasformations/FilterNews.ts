import { Noticia } from "@/Models/Noticia";

export const filterNews = (noticias: Noticia[]): Noticia[] => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return noticias.filter(noticia => noticia.publicationDate >= sevenDaysAgo);
}
