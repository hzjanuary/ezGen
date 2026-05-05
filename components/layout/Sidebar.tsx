// ============================================================
// ezGen — Sidebar Component (Lịch sử hội thoại)
// ============================================================

'use client';

import type { Session } from '@/types';
import {
  Plus,
  MessageSquare,
  X,
  Clock,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
  currentSessionId: string;
  onNewSession: () => void;
  onLoadSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  sessions,
  currentSessionId,
  onNewSession,
  onLoadSession,
  onDeleteSession,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:relative z-30 h-full w-72 flex-shrink-0
          bg-[var(--surface)] border-r border-[var(--border-color)]
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0
        `}
        id="chat-sidebar"
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
            Lịch sử
          </h2>
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost p-2 rounded-lg"
              onClick={onNewSession}
              title="Cuộc trò chuyện mới"
              id="new-session-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              className="btn-ghost p-2 rounded-lg md:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Clock className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--muted-fg)]">
                Chưa có cuộc trò chuyện nào
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Bắt đầu chat với Thư để tạo session đầu tiên
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between group cursor-pointer ${
                  session.id === currentSessionId
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--muted-fg)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                }`}
                onClick={() => onLoadSession(session)}
              >
                <div className="flex items-start gap-2.5 min-w-0 overflow-hidden">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {session.messages.length} tin nhắn ·{' '}
                      {formatTime(session.updatedAt)}
                    </p>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  title="Xóa cuộc trò chuyện"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <button
            onClick={onNewSession}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            id="new-chat-btn"
          >
            <Plus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </button>
        </div>
      </aside>
    </>
  );
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
