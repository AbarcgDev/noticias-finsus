import { WavBuffer } from "@/Data/Trasformations/TransformAIResponseToWAV";
import { Mp3Buffer } from "@/Data/Trasformations/TransformWAVToMP3";

export interface IAudioRepository {
    uploadAudioWAV(audioId: string, audioBuffer: WavBuffer): Promise<string>
    getAudioWAV(audioID: string): Promise<Blob>
    uploadAudioMp3(audioId: string, audioBuffer: Mp3Buffer): Promise<string>
    getAudioMp3(audioID: string): Promise<Blob>
}