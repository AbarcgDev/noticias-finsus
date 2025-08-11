export type WavBuffer = Uint8Array

export interface IAudioFileGenerator {
    generateAudio(instruction: string, content: string): Promise<WavBuffer>
}