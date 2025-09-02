import { ApiRouteHandler } from "../../../../lib/types";
import { Context } from "hono";
import { CreateNoticieroRoute, GetByIDRoute, GetLatestDraftRoute, GetLatestNoticiero, GetLatestNoticieroAudio, GetNoticieroAudioWAVRoute, ListNoticierosRoute, UpdateNoticeroRoute } from "./noticieros.routes";
import { NoticierosD1Repository } from "../../../../Infrastructure/NoticierosD1Repository";
import { Noticiero } from "../../../../Data/Models/Noticiero";
import { AudioR2Repository } from "../../../../Infrastructure/NoticieroAudioR2Repository";
import { NoticieroState } from "@/Data/Models/NoticieroState";
import { LatestNoticieroKVRepository } from "@/Infrastructure/LatestNoticieroKVRepository";
import { AudioGenParams } from "@/Infrastructure/AudioGenerationWorkflow";
import { env } from "cloudflare:workers";
import { pipelineNoticieroDraft } from "@/Data/Pipelines/PipelineNoticieroDraft";
import { RSSChanelRepository } from "@/Infrastructure/RssChanelD1Repository";
import { NotasFinsusD1Repository } from "@/Infrastructure/NotasFinsusD1Repository";

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

export const create: ApiRouteHandler<CreateNoticieroRoute> = async (c: Context) => {
    const noticiero = await pipelineNoticieroDraft(
        new RSSChanelRepository(c.env.DB),
        new NoticierosD1Repository(c.env.DB),
        new NotasFinsusD1Repository(c.env.DB),
        env.GEMINI_API_KEY
    )
    return c.json({ noticiero_id: noticiero.id }, 200)
}

export const getByID: ApiRouteHandler<GetByIDRoute> = async (c: Context) => {
    const { id } = c.req.param()
    const repo = new NoticierosD1Repository(c.env.DB);
    const noticiero = await repo.findById(id);
    if (!noticiero) {
        return c.json({ message: "Noticiero no encontrado" }, 404);
    }
    return c.json({
        id: noticiero.id,
        title: noticiero.title,
        guion: noticiero.guion,
        state: noticiero.state,
        publicationDate: noticiero.publicationDate,
        approvedBy: noticiero.approvedBy
    }, 200)
}

export const getNoticieroAudioWAV: ApiRouteHandler<GetNoticieroAudioWAVRoute> = async (c: Context) => {
    const { id, format } = c.req.param();
    const audioRepo = new AudioR2Repository(c.env.NOTICIEROS_STORAGE);
    const audioWav = (format === "wav")
        ? await audioRepo.getAudioWAV(id)
        : await audioRepo.getAudioMp3(id)
    if (!audioWav) {
        return c.json({ message: "Audio no encontrado" }, { status: 404 });
    }
    const audioWavBuffer = await audioWav.arrayBuffer();
    const audioWavBin = new Uint8Array(audioWavBuffer);
    const contentType = (format === "wav")
        ? "audio/wav"
        : "audio/mpeg";
    c.header("Content-Type", contentType);
    c.header("Content-Disposition", `inline; filename="${id}.${format}"`);
    return c.body(audioWavBin, 200);
}

export const update: ApiRouteHandler<UpdateNoticeroRoute> = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const noticierosRepo = new NoticierosD1Repository(c.env.DB);
        const noticiero = await noticierosRepo.findById(id)
        if (!noticiero) {
            return c.json({ message: "No se encontró el noticiero: " + id }, { status: 404 })
        }
        const updatedData = await c.req.json()
        const noticieroUpdated = {
            id: noticiero.id,
            title: updatedData.title ?? noticiero.title,
            state: updatedData.state ?? noticiero.state,
            guion: updatedData.guion ?? noticiero.guion,
            approvedBy: updatedData.approvedBy ?? noticiero.approvedBy,
            publicationDate: noticiero.publicationDate,
        }
        await noticierosRepo.save(noticieroUpdated);
        console.info("Noticiero actualizado")
        console.info(noticieroUpdated);
        // Llama proceso de generacion de audios si se aprueba un guion
        if (updatedData.state === NoticieroState.APPROVED) {
            const params: AudioGenParams = {
                noticieroId: id,
            }
            const workflowInstance = await c.env.AUDIO_GEN_WORKFLOW.create({ params });
            console.info("Audio generandose en workflow: " + workflowInstance.id)
        }
        return c.json({ message: "Noticiero actualizado" }, { status: 200 });
    } catch (e) {
        console.error("Error actualizando noticiero" + e)
        throw new Error("Error inesperado actualizando noticiero")
    }
}

export const getLatestNoticiero: ApiRouteHandler<GetLatestNoticiero> = async (c: Context) => {
    const repo = new LatestNoticieroKVRepository(c.env.LATEST_NOTICIERO_ST);
    const noticiero = await repo.findLatest();
    if (!noticiero) {
        return c.json({
            message: "No se encontró ningun noticiero",
        }, { status: 404 })
    }
    return c.json({
        id: noticiero.id,
        title: noticiero.title,
        guion: noticiero.guion,
        state: noticiero.state,
        approvedBy: noticiero.approvedBy,
        publicationDate: noticiero.publicationDate
    },
        { status: 200 }
    )
}

export const getLatestNoticieroAudio: ApiRouteHandler<GetLatestNoticieroAudio> = async (c: Context) => {
    const { format } = c.req.param()
    if (!format) {
        throw new Error("El parámero format es requerido");
    }
    const repo = new LatestNoticieroKVRepository(c.env.LATEST_NOTICIERO_ST);
    const noticiero: Noticiero | null = await repo.findLatest()
    if (!noticiero) {
        throw new Error("No se encontró noticiero reciente")
    }
    const audioRepo = new AudioR2Repository(c.env.NOTICIEROS_STORAGE);
    const audio = (format === "mp3")
        ? await audioRepo.getAudioMp3(noticiero.id)
        : await audioRepo.getAudioWAV(noticiero.id)
    if (!audio) {
        return c.json({ message: "Audio no encontrado" }, { status: 404 });
    }
    const audioBuffer = await audio.arrayBuffer();
    const audioBin = new Uint8Array(audioBuffer);
    const contentType = (format === "wav")
        ? "audio/wav"
        : "audio/mpeg";
    c.header("Content-Type", contentType);
    c.header("Content-Disposition", `inline; filename="${noticiero.id}.${format}"`);
    return c.body(audioBin, 200);
}

export const getLatestDraft: ApiRouteHandler<GetLatestDraftRoute> = async (c: Context) => {
    const noticierosRepo = new NoticierosD1Repository(c.env.DB);
    const noticiero = await noticierosRepo.getLatestDraft();
    if (!noticiero) {
        return c.json({ message: "No se encuentra draft reciente" }, 404)
    }
    return c.json({
        id: noticiero.id,
        title: noticiero.title,
        guion: noticiero.guion,
        state: noticiero.state,
        publicationDate: noticiero.publicationDate,
        approvedBy: noticiero.approvedBy,
    }, 200)
}