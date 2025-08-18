import * as lame from '@breezystack/lamejs';
import { WavBuffer } from "./TransformAIResponseToWAV";

export type Mp3Buffer = Uint8Array
export const transformWavToMp3 = async (wavBuffer16: Int16Array): Promise<Mp3Buffer> => {
    // Parámetros de codificación: 
    // 1. Número de canales (mono=1, estéreo=2)
    // 2. Tasa de muestreo (kHz)
    // 3. Tasa de bits (kbps)
    const mp3Encoder = new lame.Mp3Encoder(1, 24000, 128);

    // Asignar el buffer para la salida del MP3
    const mp3Data = [];

    // Codificar el buffer WAV en bloques
    const sampleBlockSize = 1152; // Un tamaño de bloque común para MP3
    for (let i = 0; i < wavBuffer16.length; i += sampleBlockSize) {
        const samples = wavBuffer16.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(samples);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Finalizar la codificación para escribir los últimos bytes
    const finalMp3buf = mp3Encoder.flush();
    if (finalMp3buf.length > 0) {
        mp3Data.push(finalMp3buf);
    }

    // Concatenar todos los buffers del MP3 en uno solo
    const finalMp3Buffer = new Uint8Array(mp3Data.flatMap(arr => Array.from(arr)));
    return finalMp3Buffer
};