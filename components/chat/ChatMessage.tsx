// ============================================================
// ezGen — Chat Message Bubble
// ============================================================

'use client';

import type { ChatMessage } from '@/types';
import { User, Sparkles, ImagePlus } from 'lucide-react';

interface Props {
  message: ChatMessage;
  onGenerateImage: (prompt: string, style?: string) => void;
}

export default function ChatMessageBubble({ message, onGenerateImage }: Props) {
  const isUser = message.role === 'user';
  const imageMatch = message.content.match(/\[GENERATE_IMAGE\]\s*(.+?)(?:\n|```|$)/);

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-[var(--surface)]' : 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]'}`}>
        {isUser ? <User className="w-4 h-4 text-[var(--muted-fg)]" /> : <Sparkles className="w-4 h-4 text-white" />}
      </div>
      <div className="max-w-[80%] min-w-0">
        <div className={`px-4 py-3 text-sm leading-relaxed ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
          <div className="chat-content">
            {message.content.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
        {!isUser && imageMatch && (
          <button onClick={() => onGenerateImage(imageMatch[1].trim())} className="mt-2 btn-primary text-xs px-4 py-2 flex items-center gap-2">
            <ImagePlus className="w-3.5 h-3.5" />
            Tạo ảnh từ prompt này
          </button>
        )}
        <p className={`text-[10px] text-[var(--muted)] mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
