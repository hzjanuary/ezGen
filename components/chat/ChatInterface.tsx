// ============================================================
// ezGen — Chat Interface Component
// Giao diện chat chính với trợ lý Thư
// Stream messages, auto-scroll, markdown rendering
// ============================================================

'use client';

import { useRef, useEffect, useState } from 'react';
import type { ChatMessage, GenerationStatus } from '@/types';
import ChatMessageBubble from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { Sparkles, Wand2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onGenerateImage: (prompt: string, style?: string) => void;
  generationStatus: GenerationStatus;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onGenerateImage,
  generationStatus,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect streaming (assistant message đang cập nhật)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.content === '') {
      setIsStreaming(true);
    } else {
      setIsStreaming(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Trợ lý Thư</h2>
          <p className="text-xs text-[var(--muted-fg)]">
            {isStreaming ? 'Đang trả lời...' : 'Sẵn sàng hỗ trợ bạn sáng tạo'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={onSendMessage} />
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              onGenerateImage={onGenerateImage}
            />
          ))
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-[var(--muted-fg)] text-sm animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Thư đang suy nghĩ...
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isStreaming || generationStatus === 'generating'}
      />
    </div>
  );
}

// ============================================================
// Welcome Screen — Hiển thị khi chưa có tin nhắn
// ============================================================

function WelcomeScreen({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const suggestions = [
    {
      icon: '🏞️',
      title: 'Phong cảnh Việt Nam',
      prompt: 'Tạo ảnh phong cảnh ruộng bậc thang Mù Cang Chải lúc bình minh',
    },
    {
      icon: '👗',
      title: 'Áo dài truyền thống',
      prompt: 'Cô gái mặc áo dài tím đi dưới hàng phượng vĩ',
    },
    {
      icon: '🏮',
      title: 'Phố cổ Hội An',
      prompt: 'Phố cổ Hội An về đêm với đèn lồng và ánh trăng',
    },
    {
      icon: '🎨',
      title: 'Nghệ thuật hiện đại',
      prompt: 'Thiết kế poster cyberpunk lấy cảm hứng từ Sài Gòn tương lai',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mb-6 animate-float">
        <Wand2 className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-xl font-bold mb-2">Xin chào! Mình là Thư 👋</h2>
      <p className="text-[var(--muted-fg)] text-sm text-center max-w-md mb-8">
        Mô tả ý tưởng bằng tiếng Việt, mình sẽ giúp bạn tạo ảnh AI tuyệt đẹp.
        Thử một gợi ý bên dưới nhé!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => onSendMessage(suggestion.prompt)}
            className="glass card-interactive rounded-xl p-4 text-left group"
          >
            <div className="text-2xl mb-2">{suggestion.icon}</div>
            <p className="text-sm font-medium mb-1 group-hover:text-[var(--primary)] transition-colors">
              {suggestion.title}
            </p>
            <p className="text-xs text-[var(--muted-fg)] line-clamp-2">
              {suggestion.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
