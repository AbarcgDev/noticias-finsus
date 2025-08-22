import { Noticia } from "../Models/Noticia";

export const filterNews = (noticias: Noticia[]): Noticia[] => {
  return filterByCensor(
    filterByDate(noticias)
  )
}

const filterByDate = (noticias: Noticia[]): Noticia[] => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);

  return noticias.filter(noticia => noticia.publicationDate >= sevenDaysAgo);
}

const filterByCensor = (noticias: Noticia[]) => {
  const censorList = [
    "sheinbaum",
    "amlo",
    "lopez obrador",
    "violencia",
    "drogas",
    "asesinato",
    "politica",
    "stori",
    "nubank",
    "spin",
    "nacional financiera",
    "nu méxico"
  ];

  return noticias.filter((noticia: Noticia) => {
    const title = noticia.title.toLowerCase();
    const body = noticia.content.toLowerCase();
    return !censorList.some((censorWord) => {
      return title.includes(censorWord) || body.includes(censorWord);
    });
  });
};