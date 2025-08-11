import { IAudioFileGenerator, WavBuffer } from "../IAudioFileGenerator";

export class GenerateAudioFile {
    constructor(private readonly generator: IAudioFileGenerator) {
    }

    execute(instructions: string, content: string): Promise<WavBuffer> {
        return this.generator.generateAudio(instructions, content);
    }
}