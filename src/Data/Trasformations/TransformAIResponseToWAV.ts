import { WavBuffer } from "@/application/IAudioFileGenerator";

const createWavBuffer = (base64Data: string, channels = 1, rate = 24000, sampleWidth = 2): WavBuffer => {
  const pcmData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  const dataLength = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // file length - 8
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format = PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * channels * sampleWidth, true); // byte rate
  view.setUint16(32, channels * sampleWidth, true); // block align
  view.setUint16(34, sampleWidth * 8, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Copiar datos PCM después del header
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmData, 44);

  return wavBytes;
}
