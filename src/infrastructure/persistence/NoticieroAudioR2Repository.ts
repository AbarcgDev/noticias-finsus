import { WavBuffer } from "@/application/IAudioFileGenerator";

export class NoticieroAudioR2Repository {
    constructor(private readonly bucket: R2Bucket) { }

    async uploadAudioWAV(audioId: string, audioBuffer: WavBuffer): Promise<string> {
        const audioKey = `noticiero-audio/${audioId}.wav`;
        await this.bucket.put(audioKey, audioBuffer, {
            httpMetadata: {
                contentType: 'audio/wav',
            },
        });
        return audioKey;
    }

    async getAudioWAV(audioID: string): Promise<Blob> {
        const audioKey = `noticiero-audio/${audioID}.wav`;
        const audio = await this.bucket.get(audioKey);
        if (!audio) {
            throw new Error(`Audio with ID ${audioID} not found`);
        }
        return audio.blob();
    }
}