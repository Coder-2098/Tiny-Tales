
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story } from "../types";
import { APP_CONFIG } from "../config/app.config";
import { PromptService } from "./prompts";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = APP_CONFIG.AI_SETTINGS.MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");
    
    if (isRateLimit && retries > 0) {
      const waitTime = APP_CONFIG.AI_SETTINGS.INITIAL_RETRY_DELAY * (APP_CONFIG.AI_SETTINGS.MAX_RETRIES - retries + 1);
      console.warn(`Gemini API rate limited. Retrying in ${waitTime}ms... (${retries} retries left)`);
      await delay(waitTime);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export const GeminiService = {
  generateStoryScene: async (
    story: Partial<Story>, 
    userPrompt: string = '', 
    visionContext: string = ''
  ): Promise<string> => {
    return withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = PromptService.buildStorySystemInstruction(story, visionContext, userPrompt);

      const response = await ai.models.generateContent({
        model: APP_CONFIG.MODELS.STORY_GENERATION,
        contents: "Please continue the story.",
        config: {
          systemInstruction,
          temperature: APP_CONFIG.AI_SETTINGS.TEMPERATURE,
        },
      });

      return response.text?.trim() || "And then, something magical happened!";
    });
  },

  generateSuggestions: async (story: Story): Promise<string[]> => {
    return withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = PromptService.getSuggestionPrompt(story.scenes[story.scenes.length - 1]?.text || "");
      
      const response = await ai.models.generateContent({
        model: APP_CONFIG.MODELS.SUGGESTIONS,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      try {
        const parsed = JSON.parse(response.text || '[]');
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["Keep exploring!", "Something magic!", "Help a friend!"];
      } catch {
        return ["Keep exploring!", "Something magic!", "Help a friend!"];
      }
    });
  },

  generateSpeech: async (text: string, voice: string = 'Puck'): Promise<string | undefined> => {
    return withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: APP_CONFIG.MODELS.SPEECH,
        contents: [{ parts: [{ text: text.substring(0, 1000) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    });
  },

  interpretImage: async (base64Data: string): Promise<{ 
    description: string; 
    confidence: number; 
    clarifyingQuestions: string[] 
  }> => {
    return withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data.split(',')[1],
        },
      };
      
      const response = await ai.models.generateContent({
        model: APP_CONFIG.MODELS.IMAGE_INTERPRETATION,
        contents: { parts: [imagePart, { text: PromptService.getImageDescriptionPrompt() }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              clarifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      
      try {
        return JSON.parse(response.text || '{}');
      } catch {
        return { description: "An amazing masterpiece!", confidence: 0.5, clarifyingQuestions: [] };
      }
    });
  },

  generateHeroIcon: async (base64Data: string): Promise<string | undefined> => {
    return withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data.split(',')[1],
        },
      };
      
      const response = await ai.models.generateContent({
        model: APP_CONFIG.MODELS.IMAGE_GENERATION,
        contents: {
          parts: [
            imagePart,
            { text: PromptService.getHeroIconPrompt() },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return undefined;
    });
  }
};
