// ============================================================
// ezGen — Image Canvas Component
// Hiển thị ảnh đã tạo + loading + actions
// ============================================================

'use client';

import { useState } from 'react';
import type { GeneratedImage, GenerationStatus, ImageStyle } from '@/types';
import { STYLE_LABELS } from '@/types';
import StyleFilter from '@/components/canvas/StyleFilter';
import {
  Download,
  Share2,
  BookmarkPlus,
  Video,
  ImagePlus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { saveToGallery } from '@/lib/storage';

interface ImageCanvasProps {
  image: GeneratedImage | null;
  status: GenerationStatus;
  onGenerate: (prompt: string, style?: string) => void;
}

export default function ImageCanvas({ image, status, onGenerate }: ImageCanvasProps) {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photorealistic');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [saved, setSaved] = useState(false);

  const handleQuickGenerate = () => {
    if (!quickPrompt.trim()) return;
    onGenerate(quickPrompt.trim(), selectedStyle);
    setQuickPrompt('');
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ezgen_${image.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(image.url, '_blank');
    }
  };

  const handleSave = () => {
    if (!image) return;
    saveToGallery(image);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async () => {
    if (!image) return;
    if (navigator.share) {
      await navigator.share({
        title: 'ezGen — Tác phẩm AI',
        text: image.prompt,
        url: image.url,
      });
    } else {
      await navigator.clipboard.writeText(image.url);
      alert('Đã copy link ảnh!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-[var(--accent)]" />
          Canvas
        </h3>
        {image && (
          <span className="text-xs text-[var(--muted-fg)]">
            {STYLE_LABELS[image.style as ImageStyle] || image.style}
          </span>
        )}
      </div>

      {/* Image Display Area */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-y-auto">
        {status === 'generating' ? (
          <LoadingState />
        ) : image ? (
          <ImageDisplay image={image} />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Actions */}
      {image && status === 'complete' && (
        <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center gap-2 flex-shrink-0">
          <button onClick={handleDownload} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5" id="download-btn">
            <Download className="w-3.5 h-3.5" /> Tải xuống
          </button>
          <button onClick={handleSave} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5" id="save-btn">
            <BookmarkPlus className="w-3.5 h-3.5" /> {saved ? '✓ Đã lưu' : 'Lưu'}
          </button>
          <button onClick={handleShare} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5" id="share-btn">
            <Share2 className="w-3.5 h-3.5" /> Chia sẻ
          </button>
          <button disabled className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5 opacity-50" title="Sắp ra mắt">
            <Video className="w-3.5 h-3.5" /> Video
          </button>
        </div>
      )}

      {/* Quick Generate */}
      <div className="p-4 border-t border-[var(--border-color)] space-y-3 flex-shrink-0">
        <StyleFilter selected={selectedStyle} onSelect={setSelectedStyle} />
        <div className="flex gap-2">
          <input
            type="text"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickGenerate()}
            placeholder="Tạo nhanh từ prompt..."
            className="input-field text-sm"
            id="quick-prompt-input"
          />
          <button
            onClick={handleQuickGenerate}
            disabled={!quickPrompt.trim() || status === 'generating'}
            className="btn-primary px-4 flex-shrink-0 disabled:opacity-30"
            id="quick-generate-btn"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center">
      <div className="w-48 h-48 rounded-2xl skeleton mx-auto mb-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
      <p className="text-sm text-[var(--muted-fg)] animate-pulse">Đang tạo ảnh...</p>
      <p className="text-xs text-[var(--muted)] mt-1">Quá trình này mất khoảng 5-15 giây</p>
    </div>
  );
}

function ImageDisplay({ image }: { image: GeneratedImage }) {
  return (
    <div className="w-full animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden shadow-lg mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.prompt} className="w-full h-auto object-cover" />
      </div>
      <p className="text-xs text-[var(--muted-fg)] line-clamp-2">{image.prompt}</p>
      {image.optimizedPrompt && image.optimizedPrompt !== image.prompt && (
        <details className="mt-1">
          <summary className="text-xs text-[var(--muted)] cursor-pointer hover:text-[var(--muted-fg)]">
            Xem prompt đã tối ưu
          </summary>
          <p className="text-xs text-[var(--muted)] mt-1 bg-[var(--background)] rounded-lg p-2">
            {image.optimizedPrompt}
          </p>
        </details>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-2xl bg-[var(--muted)]/30 flex items-center justify-center mx-auto mb-4">
        <ImagePlus className="w-8 h-8 text-[var(--muted-fg)]" />
      </div>
      <p className="text-sm text-[var(--muted-fg)] mb-1">Chưa có ảnh nào</p>
      <p className="text-xs text-[var(--muted)]">
        Chat với Thư hoặc dùng Quick Generate bên dưới
      </p>
    </div>
  );
}
