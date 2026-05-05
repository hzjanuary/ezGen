// ============================================================
// ezGen — Style Filter Component
// Bộ lọc phong cách tạo ảnh
// ============================================================

'use client';

import type { ImageStyle } from '@/types';
import { STYLE_LABELS } from '@/types';

interface StyleFilterProps {
  selected: ImageStyle;
  onSelect: (style: ImageStyle) => void;
}

const styleIcons: Record<ImageStyle, string> = {
  photorealistic: '📷',
  anime: '🎌',
  'vietnamese-art': '🏮',
  cyberpunk: '🌆',
  watercolor: '🎨',
  'oil-painting': '🖌️',
};

export default function StyleFilter({ selected, onSelect }: StyleFilterProps) {
  const styles = Object.entries(STYLE_LABELS) as [ImageStyle, string][];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {styles.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selected === key
              ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30'
              : 'bg-[var(--surface)] text-[var(--muted-fg)] border border-[var(--border-color)] hover:border-[var(--muted)]'
          }`}
        >
          <span>{styleIcons[key]}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
