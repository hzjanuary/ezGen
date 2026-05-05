// ============================================================
// ezGen — Image Generation Engine (Multi-Provider)
// Auto-fallback: Google Imagen 4.0 → Gemini 2.5 Flash Image (Banana) → OpenAI (DALL-E 3)
// ============================================================

import { STYLE_PROMPTS, type ImageStyle } from '@/types';

/** Kết quả trả về từ Image Engine */
export interface ImageResult {
  url: string;
  width: number;
  height: number;
}

/** Interface chung cho mọi Image Engine */
interface ImageEngine {
  name: string;
  generate(prompt: string, options: EngineOptions): Promise<ImageResult[]>;
}

interface EngineOptions {
  aspectRatio: string;
  numImages: number;
  style: ImageStyle;
}

// ============================================================
// Google Imagen Engine (Imagen 4.0)
// Sử dụng API generateImages theo docs mới nhất
// ============================================================
class GoogleImagenEngine implements ImageEngine {
  name = 'Google Imagen 4.0';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY chưa được cấu hình');

    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    let aspectRatioStr = '1:1';
    if (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(options.aspectRatio)) {
      aspectRatioStr = options.aspectRatio;
    }

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1, // API giới hạn số lượng tuỳ tier
        aspectRatio: aspectRatioStr as any,
        personGeneration: 'allow_all' as any, // Cho phép tạo người thật
      },
    });

    const results: ImageResult[] = [];
    const dimensions = getImageDimensions(options.aspectRatio);

    for (const generatedImage of response.generatedImages || []) {
      const base64 = generatedImage.image?.imageBytes;
      if (!base64) continue;
      results.push({
        url: `data:image/jpeg;base64,${base64}`,
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    if (results.length === 0) {
      throw new Error('Google Imagen không trả về ảnh');
    }
    return results;
  }
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
            const dimensions = getImageDimensions(options.aspectRatio);
            results.push({
              url: dataUrl,
              width: dimensions.width,
              height: dimensions.height,
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

// ============================================================
// OpenAI Engine (DALL-E 3)
// ============================================================
class OpenAIEngine implements ImageEngine {
  name = 'OpenAI (DALL-E 3)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY chưa được cấu hình');

    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;
    
    // DALL-E 3 chỉ hỗ trợ các size: 1024x1024, 1024x1792, 1792x1024
    let size = '1024x1024';
    if (options.aspectRatio === '16:9' || options.aspectRatio === '4:3') size = '1792x1024';
    if (options.aspectRatio === '9:16' || options.aspectRatio === '3:4') size = '1024x1792';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1, // DALL-E 3 chỉ hỗ trợ n=1
        size,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI DALL-E 3 ${response.status}: ${error}`);
    }

    const data = await response.json();
    const dimensions = getImageDimensions(options.aspectRatio); // Fallback dimension for UI
    
    return (data.data || []).map((img: { b64_json?: string; url?: string }) => ({
      url: img.b64_json
        ? `data:image/png;base64,${img.b64_json}`
        : img.url || '',
      width: dimensions.width,
      height: dimensions.height,
    }));
  }
}

// ============================================================
// Pollinations AI Engine (Free Fallback Cuối Cùng)
// ============================================================
class PollinationsEngine implements ImageEngine {
  name = 'Pollinations AI (Free)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const dimensions = getImageDimensions(options.aspectRatio);
    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;
    
    // Đảm bảo cache-busting bằng seed ngẫu nhiên
    const seed = Math.floor(Math.random() * 100000);
    const encodedPrompt = encodeURIComponent(fullPrompt.substring(0, 1000));
    
    const results: ImageResult[] = [];
    for (let i = 0; i < options.numImages; i++) {
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&seed=${seed + i}&model=flux`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch from Pollinations');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        results.push({
          url: `data:image/jpeg;base64,${base64}`,
          width: dimensions.width,
          height: dimensions.height,
        });
      } catch (e) {
        console.warn('Pollinations fetch error', e);
        results.push({
          url,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }
    return results;
  }
}

// ============================================================
// Factory & Fallback Management
// ============================================================
export class AutoFallbackEngine implements ImageEngine {
  name = 'Auto Fallback (Imagen → Gemini → OpenAI → Pollinations)';

  static getSpecificEngine(engineName: string): ImageEngine | null {
    switch (engineName) {
      case 'imagen':
        return process.env.GOOGLE_AI_API_KEY ? new GoogleImagenEngine() : null;
      case 'gemini':
        return process.env.GOOGLE_AI_API_KEY ? new GeminiImageEngine() : null;
      case 'openai':
        return process.env.OPENAI_API_KEY ? new OpenAIEngine() : null;
      case 'pollinations':
        return new PollinationsEngine();
      default:
        return null;
    }
  }

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const engines: Array<{ engine: ImageEngine; key: string | null }> = [
      { engine: new GoogleImagenEngine(), key: 'GOOGLE_AI_API_KEY' },
      { engine: new GeminiImageEngine(), key: 'GOOGLE_AI_API_KEY' },
      { engine: new OpenAIEngine(), key: 'OPENAI_API_KEY' },
      { engine: new PollinationsEngine(), key: null }, // Pollinations không cần key
    ];

    let lastError: Error | null = null;
    let errors: string[] = [];

    for (const { engine, key } of engines) {
      try {
        if (key && !process.env[key]) {
          console.warn(`[ImageEngine] Bỏ qua ${engine.name} vì thiếu key ${key}`);
          continue;
        }

        console.log(`[ImageEngine] Đang thử tạo ảnh với ${engine.name}...`);
        const result = await engine.generate(prompt, options);
        console.log(`[ImageEngine] Thành công với ${engine.name}!`);
        return result;
      } catch (error) {
        lastError = error as Error;
        const msg = `[ImageEngine] ${engine.name} lỗi: ${lastError.message}`;
        console.warn(msg);
        errors.push(msg);
      }
    }

    throw new Error(`Tất cả engine đều lỗi:\n${errors.join('\n')}`);
  }
}

export function getImageEngine(engineName: string = 'auto'): ImageEngine {
  if (engineName !== 'auto') {
    const engine = AutoFallbackEngine.getSpecificEngine(engineName);
    if (engine) return engine;
    console.warn(`Engine ${engineName} không có sẵn hoặc thiếu API key, chuyển sang chế độ auto-fallback`);
  }
  return new AutoFallbackEngine();
}

function getImageDimensions(aspectRatio: string) {
  switch (aspectRatio) {
    case '16:9': return { width: 1024, height: 576 };
    case '9:16': return { width: 576, height: 1024 };
    case '4:3': return { width: 1024, height: 768 };
    case '3:4': return { width: 768, height: 1024 };
    default: return { width: 1024, height: 1024 };
  }
}
