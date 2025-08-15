import { GenerateContentResponse, GoogleGenAI } from "@google/genai";

export const generateAudioWithAI = async (instruction: string, content: string, apiKey: string): Promise<GenerateContentResponse> => {
  const gemini = new GoogleGenAI({ apiKey: apiKey })
  const response: GenerateContentResponse = await gemini.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: instruction + "\n" + content, }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'FIN',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' }
              }
            },
            {
              speaker: 'SUS',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Leda' }
              }
            }
          ]
        }
      }
    }
  })
  return response;
}

