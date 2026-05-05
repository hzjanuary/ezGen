// ============================================================
// ezGen — Gallery Page
// Hiển thị tác phẩm đã lưu, filter, masonry grid
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import type { GalleryItem, ImageStyle } from '@/types';
import { STYLE_LABELS } from '@/types';
import { getGalleryItems, removeFromGallery, toggleFavorite } from '@/lib/storage';
import {
  Images,
  Heart,
  Download,
  Trash2,
  X,
  Filter,
  Star,
} from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [styleFilter, setStyleFilter] = useState<ImageStyle | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    setItems(getGalleryItems());
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === 'favorites' && !item.isFavorite) return false;
    if (styleFilter !== 'all' && item.image.style !== styleFilter) return false;
    return true;
  });

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setItems(getGalleryItems());
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa tác phẩm này khỏi gallery?')) {
      removeFromGallery(id);
      setItems(getGalleryItems());
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ezgen_${id}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Images className="w-8 h-8 text-[var(--accent)]" />
            Gallery
          </h1>
          <p className="text-[var(--muted-fg)]">
            Bộ sưu tập tác phẩm AI của bạn ({items.length} tác phẩm)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-1 glass rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'all' ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'text-[var(--muted-fg)] hover:text-[var(--foreground)]'}`}
            >
              <Filter className="w-3 h-3 inline mr-1" /> Tất cả
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'favorites' ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'text-[var(--muted-fg)] hover:text-[var(--foreground)]'}`}
            >
              <Star className="w-3 h-3 inline mr-1" /> Yêu thích
            </button>
          </div>

          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value as ImageStyle | 'all')}
            className="input-field text-xs py-1.5 px-3 w-auto"
            id="style-filter"
          >
            <option value="all">Mọi phong cách</option>
            {Object.entries(STYLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <Images className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
            <p className="text-lg text-[var(--muted-fg)] mb-2">
              {items.length === 0 ? 'Gallery đang trống' : 'Không có tác phẩm phù hợp'}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {items.length === 0 ? 'Hãy tạo ảnh đầu tiên trong Dashboard!' : 'Thử thay đổi bộ lọc'}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="break-inside-avoid glass rounded-2xl overflow-hidden card-interactive group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image.url} alt={item.image.prompt} className="w-full h-auto" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Xem chi tiết
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-[var(--muted-fg)] line-clamp-2 mb-2">{item.image.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                      {STYLE_LABELS[item.image.style as ImageStyle] || item.image.style}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleFavorite(item.id)} className="btn-ghost p-1.5">
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      <button onClick={() => handleDownload(item.image.url, item.id)} className="btn-ghost p-1.5">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn-ghost p-1.5 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedItem(null)}>
          <div className="glass-strong rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
              <h3 className="text-sm font-semibold">Chi tiết tác phẩm</h3>
              <button onClick={() => setSelectedItem(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedItem.image.url} alt={selectedItem.image.prompt} className="w-full rounded-xl mb-4" />
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Prompt gốc</p>
                  <p className="text-sm">{selectedItem.image.prompt}</p>
                </div>
                {selectedItem.image.optimizedPrompt && (
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-1">Prompt đã tối ưu</p>
                    <p className="text-sm text-[var(--muted-fg)]">{selectedItem.image.optimizedPrompt}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span>Engine: {selectedItem.image.engine}</span>
                  <span>·</span>
                  <span>{new Date(selectedItem.image.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
