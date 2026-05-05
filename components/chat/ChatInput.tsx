// ============================================================
// ezGen — Chat Input Component
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border-color)] flex-shrink-0">
      <div className="flex items-end gap-2 glass rounded-xl p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mô tả ý tưởng của bạn... (Shift+Enter xuống dòng)"
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm px-2 py-1.5 placeholder-[var(--muted-fg)] text-[var(--foreground)] disabled:opacity-50"
          id="chat-input"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="btn-primary p-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          id="chat-send-btn"
          aria-label="Gửi tin nhắn"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-[var(--muted)] mt-2 text-center">
        Thư sử dụng AI để tối ưu prompt. Kết quả có thể không hoàn hảo.
      </p>
    </div>
  );
}
