// ============================================================
// ezGen — Local Storage Utilities
// Quản lý Gallery và Session bằng localStorage (client-side)
// ============================================================

import type { GalleryItem, GeneratedImage, Session } from '@/types';

const GALLERY_KEY = 'ezgen_gallery';
const SESSIONS_KEY = 'ezgen_sessions';

// ============================================================
// Gallery Operations
// ============================================================

/** Lấy tất cả tác phẩm từ Gallery */
export function getGalleryItems(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(GALLERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Lưu ảnh vào Gallery */
export function saveToGallery(image: GeneratedImage, note?: string): GalleryItem {
  const items = getGalleryItems();
  const newItem: GalleryItem = {
    id: generateId(),
    image,
    note,
    isFavorite: false,
    savedAt: Date.now(),
  };
  items.unshift(newItem); // Thêm vào đầu danh sách
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  return newItem;
}

/** Xóa tác phẩm khỏi Gallery */
export function removeFromGallery(itemId: string): void {
  const items = getGalleryItems().filter((item) => item.id !== itemId);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

/** Toggle yêu thích */
export function toggleFavorite(itemId: string): void {
  const items = getGalleryItems();
  const item = items.find((i) => i.id === itemId);
  if (item) {
    item.isFavorite = !item.isFavorite;
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  }
}

// ============================================================
// Session Operations
// ============================================================

/** Lấy tất cả sessions */
export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Lưu session */
export function saveSession(session: Session): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/** Xóa session */
export function deleteSession(sessionId: string): void {
  const sessions = getSessions().filter((s) => s.id !== sessionId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ============================================================
// Utilities
// ============================================================

/** Tạo ID ngẫu nhiên */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
