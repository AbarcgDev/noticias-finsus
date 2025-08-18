import { WavBuffer } from "../Data/Trasformations/TransformAIResponseToWAV";
import { Mp3Buffer } from "../Data/Trasformations/TransformWAVToMP3";

export interface IAudioRepository {
    uploadAudioWAV(audioId: string, audioBuffer: WavBuffer): Promise<void>
    getAudioWAV(audioID: string): Promise<Blob>
    uploadAudioMp3(audioId: string, audioBuffer: Mp3Buffer): Promise<void>
    getAudioMp3(audioID: string): Promise<Blob>
}