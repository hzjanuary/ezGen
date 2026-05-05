// ============================================================
// ezGen — API Route: /api/generate-video (Placeholder)
// Cấu trúc sẵn sàng cho Video Engine trong tương lai
// ============================================================

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, engine = 'runway', sourceImageUrl, duration = 4 } = body as {
      prompt: string;
      engine?: string;
      sourceImageUrl?: string;
      duration?: number;
    };

    if (!prompt) {
      return Response.json(
        { error: 'Vui lòng nhập mô tả cho video' },
        { status: 400 }
      );
    }

    // Video engine chưa được tích hợp — trả về thông báo
    return Response.json({
      success: false,
      message: `🚧 Tính năng tạo video bằng ${engine} đang được phát triển!`,
      comingSoon: true,
      requestedConfig: {
        prompt,
        engine,
        sourceImageUrl,
        duration,
      },
    }, { status: 202 });
  } catch (error) {
    console.error('Video generation error:', error);
    return Response.json(
      { error: 'Lỗi không xác định' },
      { status: 500 }
    );
  }
}
