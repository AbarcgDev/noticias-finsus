import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { WavBuffer } from './TransformAIResponseToWAV';

const ffmpeg = new FFmpeg();
export type Mp3Buffer = Uint8Array;

export const transformWavToMp3 = async (wavBuffer: WavBuffer): Promise<Mp3Buffer> => {
    if (!ffmpeg.loaded) {
        await ffmpeg.load();
    }

    const inputFileName = 'input.wav';
    const outputFileName = 'output.mp3';
    await ffmpeg.writeFile(inputFileName, wavBuffer);
    await ffmpeg.exec(['-i', inputFileName, outputFileName]);
    const mp3Data = await ffmpeg.readFile(outputFileName);
    return mp3Data as Uint8Array;
};