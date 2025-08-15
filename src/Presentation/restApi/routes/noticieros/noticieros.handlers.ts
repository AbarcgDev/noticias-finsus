import { ApiRouteHandler } from "@/lib/types";
import { Context } from "hono";
import { GetNoticieroAudioWAVRoute, ListNoticierosRoute } from "./noticieros.routes";
import { NoticierosD1Repository } from "@/Infrastructure/NoticierosD1Repository";
import { Noticiero } from "@/Data/Models/Noticiero";
import { AudioR2Repository } from "@/Infrastructure/NoticieroAudioR2Repository";

export const list: ApiRouteHandler<ListNoticierosRoute> = async (c: Context) => {
    const noticierosRepository = new NoticierosD1Repository(c.env.DB);
    const noticieros = await noticierosRepository.findAll();
    if (!noticieros || noticieros.length === 0) {
        return c.json({ message: "No hay noticieros disponibles" }, { status: 404 });
    }
    return c.json(noticieros.map((noticiero: Noticiero) => ({
        id: noticiero.id,
        title: noticiero.title,
        guion: noticiero.guion,
        state: noticiero.state,
        publicationDate: noticiero.publicationDate,
        approvedBy: noticiero.approvedBy
    })), { status: 200 });
}

export const getNoticieroAudioWAV: ApiRouteHandler<GetNoticieroAudioWAVRoute> = async (c: Context) => {
    const { id } = c.req.param();
    const noticierosRepository = new NoticierosD1Repository(c.env.DB);
    const noticiero = await noticierosRepository.findById(id);
    if (!noticiero) {
        return c.json({ message: "Noticiero no encontrado" }, { status: 404 });
    }
    const audioRepo = new AudioR2Repository(c.env.NOTICIEROS_STORAGE);
    const audioWav = await audioRepo.getAudioWAV(noticiero.id);
    if (!audioWav) {
        return c.json({ message: "Audio no encontrado" }, { status: 404 });
    }
    const audioWavBuffer = await audioWav.arrayBuffer();
    const audioWavBin = new Uint8Array(audioWavBuffer);
    c.header("Content-Type", "audio/wav");
    c.header("Content-Disposition", `inline; filename="${noticiero.id}.wav"`);
    return c.body(audioWavBin, 200);
}
