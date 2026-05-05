// ============================================================
// ezGen — Image Generation Engine (Gemini 2.5 Flash Image Only)
// ============================================================

import { STYLE_PROMPTS } from '@/types';
import type { ImageStyle } from '@/types';

export interface ImageResult {
  url: string;
  width: number;
  height: number;
}

export interface EngineOptions {
  aspectRatio: string;
  numImages: number;
  style: ImageStyle;
}

export interface ImageEngine {
  name: string;
  generate(prompt: string, options: EngineOptions): Promise<ImageResult[]>;
}

// ============================================================
// Gemini Native Image Engine (Banana) (gemini-2.5-flash-image)
// ============================================================
class GeminiImageEngine implements ImageEngine {
  name = 'Gemini 2.5 Flash Image';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY chưa được cấu hình');

    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const results: ImageResult[] = [];
    for (let i = 0; i < options.numImages; i++) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: fullPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            
            let width = 1024, height = 1024;
            if (options.aspectRatio === '16:9' || options.aspectRatio === '4:3') { width = 1024; height = 576; }
            if (options.aspectRatio === '9:16' || options.aspectRatio === '3:4') { width = 576; height = 1024; }

            results.push({
              url: dataUrl,
              width,
              height,
            });
          }
        }
      }
    }

    if (results.length === 0) {
      throw new Error('Gemini không trả về ảnh');
    }
    return results;
  }
}

export function getImageEngine(engineName: string = 'auto'): ImageEngine {
  // Chỉ hỗ trợ Gemini 2.5 Flash Image
  return new GeminiImageEngine();
}
