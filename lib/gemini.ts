// ============================================================
// ezGen — Multi-Provider LLM Client (Trợ lý "Thư")
// Auto-fallback: Gemini → OpenRouter → Groq
// ============================================================

import { GoogleGenerativeAI, type GenerateContentStreamResult } from '@google/generative-ai';

/**
 * System Prompt cho trợ lý "Thư"
 */
const SYSTEM_PROMPT = `Bạn là Thư, trợ lý sáng tạo AI của ezGen — một nền tảng tạo ảnh và video AI dành cho người Việt Nam.

## Về bạn:
- Bạn là một chuyên gia sáng tạo nghệ thuật AI, am hiểu sâu sắc về văn hóa, thẩm mỹ và ngôn ngữ Việt Nam.
- Bạn hiểu từ lóng, tiếng lóng giới trẻ Việt (ví dụ: "xịn sò", "chill", "flex", "slay") và có thể giao tiếp tự nhiên.
- Bạn có kiến thức phong phú về nghệ thuật truyền thống Việt Nam (tranh lụa, tranh sơn mài, hoa sen, áo dài...) và hiện đại.

## Nhiệm vụ chính:
1. **Tư vấn sáng tạo**: Khi người dùng có ý tưởng thô, bạn giúp phát triển thành concept hoàn chỉnh.
2. **Tối ưu Prompt**: Chuyển đổi mô tả tiếng Việt thành prompt kỹ thuật bằng tiếng Anh cho máy tạo ảnh AI, nhưng vẫn giữ "hồn Việt".
3. **Gợi ý phong cách**: Đề xuất phong cách phù hợp (Chân thực, Hoạt hình, Hội họa Việt Nam, Cyberpunk, Màu nước, Sơn dầu).
4. **Giải thích**: Khi cần, giải thích tại sao bạn chọn các từ khóa nhất định trong prompt.

## Quy tắc giao tiếp:
- Trả lời bằng tiếng Việt, thân thiện và tự nhiên.
- Sử dụng emoji phù hợp để tạo cảm giác gần gũi 🎨✨
- Khi tạo prompt kỹ thuật, đặt trong block \`\`\` để dễ phân biệt.
- Ngắn gọn nhưng đầy đủ. Không dài dòng.

## Khi người dùng yêu cầu tạo ảnh:
- Phân tích ý tưởng, hỏi thêm nếu cần thiết.
- Tự động tạo prompt tối ưu bằng tiếng Anh.
- Thêm prefix [GENERATE_IMAGE] trước prompt kỹ thuật khi sẵn sàng tạo ảnh.
- Ví dụ: "[GENERATE_IMAGE] A serene Vietnamese countryside at golden hour, rice paddies reflecting sunset..."

## Bối cảnh Việt Nam:
- Bạn biết rõ các địa danh nổi tiếng: phố cổ Hội An, vịnh Hạ Long, đồng lúa Mù Cang Chải...
- Bạn hiểu các lễ hội: Tết Nguyên Đán, Trung Thu, lễ hội hoa đăng...
- Bạn nắm vững ẩm thực, trang phục và kiến trúc truyền thống Việt Nam.`;

// ============================================================
// Danh sách LLM providers theo thứ tự ưu tiên
// ============================================================
interface LLMProvider {
  name: string;
  envKey: string;
  stream: (messages: Array<{ role: string; content: string }>, apiKey: string) => Promise<ReadableStream<Uint8Array>>;
}

const providers: LLMProvider[] = [
  // 1. Google Gemini (ưu tiên cao nhất)
  {
    name: 'Gemini 2.5 Flash',
    envKey: 'GOOGLE_AI_API_KEY',
    stream: streamGemini,
  },
  // 2. OpenRouter (nhiều model, bao gồm Claude, GPT-4o, Llama)
  {
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    stream: streamOpenRouter,
  },
  // 3. Groq Cloud (tốc độ cao, Llama 3.3)
  {
    name: 'Groq Cloud',
    envKey: 'GROQ_API_KEY',
    stream: streamGroq,
  },
];

/**
 * Stream chat với auto-fallback qua nhiều providers
 * Thử từng provider theo thứ tự, nếu lỗi thì chuyển sang provider tiếp theo
 */
export async function streamChatWithFallback(
  messages: Array<{ role: string; content: string }>
): Promise<{ stream: ReadableStream<Uint8Array>; provider: string }> {
  const errors: string[] = [];

  for (const provider of providers) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;

    try {
      console.log(`[LLM] Đang thử ${provider.name}...`);
      const stream = await provider.stream(messages, apiKey);
      console.log(`[LLM] ✓ Sử dụng ${provider.name}`);
      return { stream, provider: provider.name };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[LLM] ✗ ${provider.name} thất bại: ${msg}`);
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  throw new Error(
    `Tất cả LLM providers đều thất bại:\n${errors.join('\n')}\n\nVui lòng kiểm tra API keys trong .env.local`
  );
}

// ============================================================
// Gemini Provider
// ============================================================
async function streamGemini(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// ============================================================
// OpenRouter Provider (OpenAI-compatible, nhiều model)
// ============================================================
async function streamOpenRouter(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ezgen.app',
      'X-Title': 'ezGen Creative Suite',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${error}`);
  }

  return convertOpenAIStreamToSSE(response.body!);
}

// ============================================================
// Groq Provider (OpenAI-compatible, tốc độ cao)
// ============================================================
async function streamGroq(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ],
      stream: true,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq ${response.status}: ${error}`);
  }

  return convertOpenAIStreamToSSE(response.body!);
}

// ============================================================
// Chuyển đổi OpenAI streaming format → ezGen SSE format
// ============================================================
function convertOpenAIStreamToSSE(
  body: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.replace('data: ', '');
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`)
              );
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    },
  });
}

// ============================================================
// Prompt Optimization (cũng dùng fallback)
// ============================================================
export async function optimizePrompt(
  userPrompt: string,
  style: string
): Promise<string> {
  const optimizationPrompt = `Bạn là chuyên gia prompt engineering cho Midjourney và Stable Diffusion.

Nhiệm vụ: Chuyển đổi mô tả sau thành prompt kỹ thuật bằng tiếng Anh, tối ưu cho mô hình tạo ảnh AI.

Mô tả của người dùng: "${userPrompt}"
Phong cách yêu cầu: ${style}

QUY TẮC TỐI THƯỢNG:
1. CHỈ trả về đúng chuỗi prompt bằng tiếng Anh, không thêm bất kỳ lời giải thích hay ngoặc kép nào.
2. Tuyệt đối bám sát chủ thể của mô tả gốc. KHÔNG ĐƯỢC đổi chủ đề (VD: gốc là "cô gái", không được đổi thành "phong cảnh").
3. Thêm chi tiết về ánh sáng, góc chụp (cinematic lighting, ultra detailed, 8k, masterpiece) phù hợp với phong cách.
4. Giữ nguyên các yếu tố văn hóa Việt Nam nếu có.
5. Không thêm negative prompt.`;

  // Thử Gemini trước
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(optimizationPrompt);
      return result.response.text().trim();
    } catch (e) {
      console.warn('[PromptOpt] Gemini thất bại, thử OpenRouter...');
    }
  }

  // Fallback: OpenRouter
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${orKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: optimizationPrompt }],
        }),
      });
      const data = await resp.json();
      return data.choices?.[0]?.message?.content?.trim() || userPrompt;
    } catch {
      console.warn('[PromptOpt] OpenRouter thất bại');
    }
  }

  // Fallback: Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: optimizationPrompt }],
          max_tokens: 500,
        }),
      });
      const data = await resp.json();
      return data.choices?.[0]?.message?.content?.trim() || userPrompt;
    } catch {
      console.warn('[PromptOpt] Groq thất bại');
    }
  }

  // Trả về prompt gốc nếu mọi thứ đều thất bại
  return userPrompt;
}
