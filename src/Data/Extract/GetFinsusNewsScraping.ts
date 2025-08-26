import { XMLParser } from "fast-xml-parser";
import { getRssRaw } from "./GetNewsFromRss"
import { Noticia } from "../Models/Noticia";
import { filterNews } from "../Trasformations/FilterNews";
import { cleanHtmlWithRewriter, extractBody } from "../Trasformations/CleanHtml";

export const getFinsusNoticiasFromGoogle = async () => {
    const rss = await getRssRaw(`https://news.google.com/rss/search?q="Finsus"&hl=es`);
    const noticias = await extractNews(rss);
    const filtrado = filterNews(noticias);
    const html = await mapContentToHtml(filtrado);
    console.info(html);
}

const extractNews = (xmlString: string): Promise<Noticia[]> => {
    const parser = new XMLParser();

    const feedContent = parser.parse(xmlString);
    const items = feedContent.rss?.channel?.item || [];

    const newsPromises = items.map(async (item: any) => {
        return {
            title: item.title || "",
            categories: item.category || [],
            publicationDate: new Date(item.pubDate),
            content: item.link,
            source: item.source || ""
        } as Noticia;
    });

    return Promise.all(newsPromises);
}

const mapContentToHtml = (noticias: Noticia[]): Promise<Noticia[]> => {
    const promises = noticias.map(async (noticia: Noticia): Promise<Noticia> => {
        const finalUrl = await getFinalUrl(noticia.content);
        if (!finalUrl) {
            throw new Error("No se pudo obtener URL");
        }
        const response = await fetch(finalUrl);
        console.info(finalUrl)
        const body = await extractBody(response);
        const bodyText = await body.text()
        console.info(bodyText);
        const cleaned = await cleanHtmlWithRewriter(bodyText)
        return {
            ...noticia,
            content: cleaned
        }
    });
    return Promise.all(promises)
}

async function getFinalUrl(googleRedirectUrl: string): Promise<string | null> {
    try {
        const response = await fetch(googleRedirectUrl, {
            redirect: 'manual', // Desactiva el seguimiento automático
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        // Si hay una redirección HTTP (301, 302, etc.), extrae la URL de la cabecera Location
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('Location');
            if (location) {
                return location;
            }
        }

        // Si la respuesta es 200 (OK), significa que es una página intermedia.
        // Ahora tienes que analizar el HTML para encontrar el enlace.
        if (response.status === 200) {
            const html = await response.text();

            // Lógica para encontrar el enlace en el HTML (usando HTMLRewriter, por ejemplo)
            let finalUrl: string | null = null;
            class UrlExtractor {
                element(element: any) {
                    const href = element.getAttribute('href');
                    if (href && href.startsWith('http') && !href.includes('google')) {
                        finalUrl = href;
                        throw new Error('URL found');
                    }
                }
            }

            await new HTMLRewriter().on('a', new UrlExtractor()).transform(new Response(html)).text();

            return finalUrl;
        }

        return null; // Si no hay redirección ni página con contenido relevante

    } catch (error) {
        console.error("Error al obtener la URL final:", error);
        return null;
    }
}