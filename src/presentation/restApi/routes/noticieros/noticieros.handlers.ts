import { Noticiero } from "@/domain/noticieros/Noticiero";
import { NoticierosD1Repository } from "@/infrastructure/persistence/NoticierosD1Repository";
import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { GetNoticieroAudioWAVRoute, GetNoticieroByIdRoute, ListNoticierosRoute } from "./noticieros.routes";
import { NoticieroAudioR2Repository } from "@/infrastructure/persistence/NoticieroAudioR2Repository";

export const list: ApiRouteHandler<ListNoticierosRoute> = async (c: Context) => {
    const noticierosRepository = new NoticierosD1Repository(c.env.DB);
    const noticieros = await noticierosRepository.listNoticieros();
    if (!noticieros || noticieros.length === 0) {
        return c.json({ message: "No hay noticieros disponibles" }, { status: 404 });
    }
    return c.json(noticieros.map((noticiero: Noticiero) => ({
        id: noticiero.id,
        title: noticiero.title,
        transcript: noticiero.transcript,
        wavAudioId: noticiero.wavAudioId,
        publication_date: noticiero.publication_date.toISOString(),
    })), { status: 200 });
}

export const getNoticieroAudioWAV: ApiRouteHandler<GetNoticieroAudioWAVRoute> = async (c: Context) => {
    const { id } = c.req.param();
    const noticierosRepository = new NoticierosD1Repository(c.env.DB);
    const noticiero = await noticierosRepository.getNoticieroById(id);
    if (!noticiero) {
        return c.json({ message: "Noticiero no encontrado" }, { status: 404 });
    }
    const audioRepo = new NoticieroAudioR2Repository(c.env.NOTICIEROS_STORAGE);
    const audioWav = await audioRepo.getAudioWAV(noticiero.wavAudioId);
    if (!audioWav) {
        return c.json({ message: "Audio no encontrado" }, { status: 404 });
    }
    const audioWavBuffer = await audioWav.arrayBuffer();
    const audioWavBin = new Uint8Array(audioWavBuffer);
    c.header("Content-Type", "audio/wav");
    c.header("Content-Disposition", `inline; filename="${noticiero.wavAudioId}"`);
    return c.body(audioWavBin, 200);
}

export const getNoticieroById: ApiRouteHandler<GetNoticieroByIdRoute> = async (c: Context) => {
    const { id } = c.req.param();
    if (!id) {
        return c.json({ message: "Parametro id es obligatorio" }, 400)
    }
    const noticierosRepository = new NoticierosD1Repository(c.env.DB);
    const noticiero = await noticierosRepository.getNoticieroById(id);
    if (!noticiero) {
        return c.json({ message: "Noticiero no encontrado" }, 404)
    }
    return c.json({
        id: noticiero.id
        title: noticiero.title
        guion: noticiero.guion
        state: noticiero.state
        updated_date: noticiero.updatedDate
        publication_date: noticiero.publicationDate
        aproved_by: noticiero.aprovedBy
        wav_file_id: noticiero.wavFileId
        mp3_file_id: noticiero.mp3FileId
    }, 200)
}
