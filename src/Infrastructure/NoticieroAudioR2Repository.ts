import { IAudioRepository } from "@/Repositories/IAudioRepository";
import { WavBuffer } from "../Data/Trasformations/TransformAIResponseToWAV";
import { Mp3Buffer } from "../Data/Trasformations/TransformWAVToMP3";


export class AudioR2Repository implements IAudioRepository {
    constructor(private readonly bucket: R2Bucket) { }

    async uploadAudioWAV(audioId: string, audioBuffer: WavBuffer): Promise<void> {
        const audioKey = `noticiero-audio/${audioId}.wav`;
        await this.bucket.put(audioKey, audioBuffer, {
            httpMetadata: {
                contentType: 'audio/wav',
            },
        });
    }

    async getAudioWAV(audioID: string): Promise<Blob> {
        const audioKey = `noticiero-audio/${audioID}.wav`;
        const audio = await this.bucket.get(audioKey);
        if (!audio) {
            throw new Error(`Audio with ID ${audioID} not found`);
        }
        return audio.blob();
    }

    async uploadAudioMp3(audioId: string, audioBuffer: Mp3Buffer): Promise<void> {
        const audioKey = `noticiero-audio/${audioId}.mp3`;
        await this.bucket.put(audioKey, audioBuffer, {
            httpMetadata: {
                contentType: 'audio/mpeg',
            },
        });
    }

    async getAudioMp3(audioID: string): Promise<Blob> {
        const audioKey = `noticiero-audio/${audioID}.mp3`;
        const audio = await this.bucket.get(audioKey);
        if (!audio) {
            throw new Error(`Audio with ID ${audioID} not found`);
        }
        return audio.blob();
    }

    dispose() {
        (this.bucket as any).dispose();
    }
}