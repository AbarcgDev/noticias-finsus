export type WavBuffer = Uint8Array<ArrayBuffer>;

export interface IAudioFileGenerator {
    generateAudio(instruction: string, content: string): Promise<WavBuffer>
}