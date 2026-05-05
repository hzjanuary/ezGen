// ============================================================
// ezGen — API Route: /api/generate-image
// Xử lý yêu cầu tạo ảnh từ prompt đã tối ưu
// Hỗ trợ nhiều engine: Fal.ai, Imagen 3, Mock
// ============================================================

import { getImageEngine } from '@/lib/image-engine';
import { optimizePrompt } from '@/lib/gemini';
import type { ImageStyle } from '@/types';
import { STYLE_PROMPTS } from '@/types';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
// Cho phép thời gian xử lý dài hơn cho image generation
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      style = 'photorealistic',
      engine = 'auto',
      aspectRatio = '1:1',
      numImages = 1,
      autoOptimize = true,
    } = body as {
      prompt: string;
      style?: ImageStyle;
      engine?: string;
      aspectRatio?: string;
      numImages?: number;
      autoOptimize?: boolean;
    };

    if (!prompt) {
      return Response.json(
        { error: 'Vui lòng nhập mô tả cho ảnh' },
        { status: 400 }
      );
    }

    // Bước 1: Tối ưu prompt qua LLM (nếu bật) — dùng fallback chain
    let optimizedPrompt = prompt;
    if (autoOptimize) {
      try {
        const styleName = STYLE_PROMPTS[style] || style;
        optimizedPrompt = await optimizePrompt(prompt, styleName);
      } catch (error) {
        // Ném luôn lỗi nếu Ollama không chạy theo blueprint mới
        console.error('Lỗi khi tối ưu prompt qua Ollama:', error);
        throw error;
      }
    }

    // Bước 2: Tạo ảnh qua Engine
    const imageEngine = getImageEngine(engine);
    const results = await imageEngine.generate(optimizedPrompt, {
      aspectRatio,
      numImages,
      style,
    });

    // Bước 3: Trả về kết quả
    return Response.json({
      success: true,
      images: results.map((img, index) => ({
        id: `img_${Date.now()}_${index}`,
        url: img.url,
        width: img.width,
        height: img.height,
        prompt,
        optimizedPrompt,
        style,
        engine: imageEngine.name,
        createdAt: Date.now(),
      })),
    });
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi tạo ảnh không xác định';
    return Response.json({ error: message }, { status: 500 });
  }
}
