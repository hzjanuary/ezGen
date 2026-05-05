// ============================================================
// ezGen — API Route: /api/chat
// Trợ lý "Thư" — Multi-Provider LLM với auto-fallback
// Gemini → OpenRouter → Groq → Mock
// ============================================================

import { streamChatWithFallback } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'model'; content: string }>;
    };

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Vui lòng gửi tin nhắn' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kiểm tra xem có bất kỳ LLM key nào không
    const hasAnyKey =
      process.env.GOOGLE_AI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.GROQ_API_KEY;

    if (!hasAnyKey) {
      return createMockStreamResponse(messages[messages.length - 1].content);
    }

    // Gọi LLM với auto-fallback (Gemini → OpenRouter → Groq)
    const { stream, provider } = await streamChatWithFallback(messages);
    console.log(`[Chat] Provider: ${provider}`);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-LLM-Provider': provider,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';

    // Nếu tất cả providers đều thất bại, fallback về mock
    if (message.includes('Tất cả LLM providers')) {
      const body = await request.clone().json();
      const lastMsg = body.messages?.[body.messages.length - 1]?.content || '';
      return createMockStreamResponse(lastMsg);
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Mock response khi chưa có API key
 */
function createMockStreamResponse(userMessage: string) {
  const encoder = new TextEncoder();

  let mockReply = `Xin chào! Mình là **Thư** 🎨, trợ lý sáng tạo AI của bạn.\n\n`;

  if (userMessage.toLowerCase().includes('ảnh') || userMessage.toLowerCase().includes('tạo')) {
    mockReply += `Ý tưởng của bạn rất hay! Mình sẽ giúp bạn tạo prompt tối ưu:\n\n`;
    mockReply += `\`\`\`\n[GENERATE_IMAGE] A beautiful Vietnamese landscape with golden rice terraces, traditional village houses, soft morning mist, cinematic lighting, ultra detailed, 8k\n\`\`\`\n\n`;
    mockReply += `Bạn muốn chỉnh sửa gì thêm không? ✨`;
  } else {
    mockReply += `Mình có thể giúp bạn:\n`;
    mockReply += `- 🖼️ Tạo ảnh AI từ mô tả tiếng Việt\n`;
    mockReply += `- 🎨 Tư vấn phong cách nghệ thuật\n`;
    mockReply += `- ✏️ Tối ưu prompt cho kết quả đẹp nhất\n\n`;
    mockReply += `Hãy mô tả ý tưởng của bạn nhé! 🚀`;
  }

  const words = mockReply.split(' ');
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const text = (i === 0 ? '' : ' ') + words[i];
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-LLM-Provider': 'Mock',
    },
  });
}
