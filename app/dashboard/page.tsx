// ============================================================
// ezGen — Dashboard Page
// Không gian làm việc AI: Sidebar + Chat + Canvas
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import ImageCanvas from '@/components/canvas/ImageCanvas';
import Sidebar from '@/components/layout/Sidebar';
import type { ChatMessage, GeneratedImage, Session, GenerationStatus } from '@/types';
import { generateId } from '@/lib/storage';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function DashboardPage() {
  // State quản lý session hiện tại
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(generateId());

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('ezGen_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {}
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ezGen_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update current session in sessions list whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setSessions((prev) => {
        const existingSessionIndex = prev.findIndex((s) => s.id === currentSessionId);
        const updatedSession: Session = {
          id: currentSessionId,
          title: messages[0]?.content.substring(0, 50) || 'Cuộc trò chuyện mới',
          messages,
          createdAt: existingSessionIndex >= 0 ? prev[existingSessionIndex].createdAt : Date.now(),
          updatedAt: Date.now(),
        };

        if (existingSessionIndex >= 0) {
          const newSessions = [...prev];
          newSessions[existingSessionIndex] = updatedSession;
          return newSessions;
        } else {
          return [updatedSession, ...prev];
        }
      });
    }
  }, [messages, currentSessionId]);

  // Gửi tin nhắn đến trợ lý Thư
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Tạo placeholder cho assistant response
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Gọi API chat (streaming)
      const allMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối với trợ lý Thư');
      }

      // Đọc stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Không thể đọc response');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
              // Cập nhật message theo thời gian thực
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // Kiểm tra xem response có chứa [GENERATE_IMAGE] không
      if (fullContent.includes('[GENERATE_IMAGE]')) {
        const match = fullContent.match(/\[GENERATE_IMAGE\]\s*(.+?)(?:\n|```|$)/);
        if (match) {
          await handleGenerateImage(match[1].trim());
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: `❌ ${errorMsg}. Vui lòng thử lại.` }
            : msg
        )
      );
    }
  }, [messages]);

  // Tạo ảnh từ prompt
  const handleGenerateImage = useCallback(async (prompt: string, style: string = 'photorealistic') => {
    setGenerationStatus('generating');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          engine: 'auto',
          aspectRatio: '1:1',
          numImages: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi tạo ảnh');
      }

      if (data.images && data.images.length > 0) {
        setCurrentImage(data.images[0]);
        setGenerationStatus('complete');
      } else {
        throw new Error('Không nhận được ảnh từ server');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setGenerationStatus('error');
    }
  }, []);

  // Tạo session mới
  const handleNewSession = useCallback(() => {
    setMessages([]);
    setCurrentImage(null);
    setGenerationStatus('idle');
    setCurrentSessionId(generateId());
  }, []);

  // Load session cũ
  const handleLoadSession = useCallback((session: Session) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setIsSidebarOpen(false);
  }, []);

  // Xóa session
  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const newSessions = prev.filter((s) => s.id !== sessionId);
      if (newSessions.length === 0) {
        localStorage.removeItem('ezGen_sessions');
      } else {
        localStorage.setItem('ezGen_sessions', JSON.stringify(newSessions));
      }
      return newSessions;
    });

    if (sessionId === currentSessionId) {
      setMessages([]);
      setCurrentImage(null);
      setGenerationStatus('idle');
      setCurrentSessionId(generateId());
    }
  }, [currentSessionId]);

  return (
    <div className="h-screen pt-16 flex overflow-hidden">
      {/* Sidebar Toggle (Mobile) */}
      <button
        className="fixed bottom-4 left-4 z-40 md:hidden glass rounded-full p-3 text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        id="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="w-5 h-5" />
        ) : (
          <PanelLeftOpen className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar — Lịch sử chat */}
      <Sidebar
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewSession={handleNewSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Chat Interface — Trung tâm */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-[var(--border-color)]">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onGenerateImage={handleGenerateImage}
            generationStatus={generationStatus}
          />
        </div>

        {/* Canvas — Hiển thị kết quả */}
        <div className="w-full md:w-[440px] lg:w-[500px] flex-shrink-0 flex flex-col">
          <ImageCanvas
            image={currentImage}
            status={generationStatus}
            onGenerate={handleGenerateImage}
          />
        </div>
      </div>
    </div>
  );
}
