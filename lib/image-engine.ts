// ============================================================
// ezGen — Image Generation Engine (Multi-Provider)
// Auto-fallback: Gemini Image → OpenAI (DALL-E 3) → Together AI → Fal.ai → Pollinations AI
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
// Gemini Native Image Engine (gemini-2.5-flash-image)
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
// Together AI Engine (FLUX, Stable Diffusion)
// REST API: https://api.together.ai/v1/images/generations
// ============================================================
class TogetherAIEngine implements ImageEngine {
  name = 'Together AI (FLUX)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) throw new Error('TOGETHER_API_KEY chưa được cấu hình');

    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;
    const dimensions = getImageDimensions(options.aspectRatio);

    const response = await fetch('https://api.together.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        prompt: fullPrompt,
        width: dimensions.width,
        height: dimensions.height,
        n: options.numImages,
        steps: 4,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together AI ${response.status}: ${error}`);
    }

    const data = await response.json();
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
// Fal.ai Engine (Flux Dev)
// ============================================================
class FalAIEngine implements ImageEngine {
  name = 'Fal.ai (Flux)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const apiKey = process.env.FAL_KEY;
    if (!apiKey) throw new Error('FAL_KEY chưa được cấu hình');

    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;
    const imageSizeEnum = getImageSizeEnum(options.aspectRatio);

    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: apiKey });

    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: fullPrompt,
        image_size: imageSizeEnum as "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9",
        num_images: options.numImages,
        enable_safety_checker: true,
        output_format: 'jpeg',
      },
    });

    const data = result.data as {
      images: Array<{ url: string; width: number; height: number }>;
    };

    if (!data.images || data.images.length === 0) {
      throw new Error('Fal.ai không trả về ảnh');
    }

    return data.images.map((img) => ({
      url: img.url,
      width: img.width || 1024,
      height: img.height || 1024,
    }));
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
// Pollinations AI Engine (Free, no API key needed)
// ============================================================
class PollinationsEngine implements ImageEngine {
  name = 'Pollinations AI (Free)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const dimensions = getImageDimensions(options.aspectRatio);
    const styleModifier = STYLE_PROMPTS[options.style] || '';
    const fullPrompt = `${prompt}, ${styleModifier}`;
    
    // Đảm bảo cache-busting bằng seed ngẫu nhiên
    const seed = Math.floor(Math.random() * 100000);
    const encodedPrompt = encodeURIComponent(fullPrompt.substring(0, 1000)); // Giới hạn độ dài url
    
    const results: ImageResult[] = [];
    for (let i = 0; i < options.numImages; i++) {
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&seed=${seed + i}`;
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
        // Fallback to direct URL if fetch fails
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
// Factory — Chọn engine cụ thể hoặc auto-fallback
// ============================================================

/** Lấy engine theo tên */
function getSpecificEngine(engineType: string): ImageEngine | null {
  switch (engineType) {
    case 'gemini':
      return process.env.GOOGLE_AI_API_KEY ? new GeminiImageEngine() : null;
    case 'together':
      return process.env.TOGETHER_API_KEY ? new TogetherAIEngine() : null;
    case 'openai':
      return process.env.OPENAI_API_KEY ? new OpenAIEngine() : null;
    case 'fal':
      return process.env.FAL_KEY ? new FalAIEngine() : null;
    case 'pollinations':
      return new PollinationsEngine();
    default:
      return null;
  }
}

/** Lấy engine phù hợp — có auto-fallback */
export function getImageEngine(engineType: string): ImageEngine {
  // Nếu chọn cụ thể và có key → dùng engine đó
  const specific = getSpecificEngine(engineType);
  if (specific) return specific;

  // Auto-fallback theo thứ tự ưu tiên
  return new AutoFallbackEngine();
}

/**
 * Engine tự động thử các provider theo thứ tự
 * Gemini → Together AI → Fal.ai → Mock
 */
class AutoFallbackEngine implements ImageEngine {
  name = 'Auto (Fallback)';

  async generate(prompt: string, options: EngineOptions): Promise<ImageResult[]> {
    const engines: Array<{ engine: ImageEngine; key: string }> = [
      { engine: new GeminiImageEngine(), key: 'GOOGLE_AI_API_KEY' },
      { engine: new OpenAIEngine(), key: 'OPENAI_API_KEY' },
      { engine: new TogetherAIEngine(), key: 'TOGETHER_API_KEY' },
      { engine: new FalAIEngine(), key: 'FAL_KEY' },
    ];

    const errors: string[] = [];

    for (const { engine, key } of engines) {
      if (!process.env[key]) continue;

      try {
        console.log(`[ImageGen] Đang thử ${engine.name}...`);
        const results = await engine.generate(prompt, options);
        console.log(`[ImageGen] ✓ Thành công với ${engine.name}`);
        this.name = engine.name;
        return results;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[ImageGen] ✗ ${engine.name}: ${msg}`);
        errors.push(`${engine.name}: ${msg}`);
      }
    }

    // Cuối cùng fallback về Pollinations AI
    console.warn('[ImageGen] Tất cả engines thất bại, dùng Pollinations AI');
    const pollinations = new PollinationsEngine();
    this.name = pollinations.name;
    return pollinations.generate(prompt, options);
  }
}

// ============================================================
// Utilities
// ============================================================
function getImageSizeEnum(aspectRatio: string): string {
  const map: Record<string, string> = {
    '1:1': 'square_hd',
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_16_9',
    '4:3': 'landscape_4_3',
    '3:4': 'portrait_4_3',
  };
  return map[aspectRatio] || 'square_hd';
}

function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const map: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:4': { width: 896, height: 1152 },
  };
  return map[aspectRatio] || map['1:1'];
}
