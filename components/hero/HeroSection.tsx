// ============================================================
// ezGen — Hero Section Component
// Animated gradient background, typing effect, particle dots
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

const taglines = [
  'tác phẩm nghệ thuật AI',
  'ảnh chân dung tuyệt đẹp',
  'phong cảnh Việt Nam hùng vĩ',
  'thiết kế sáng tạo độc đáo',
];

export default function HeroSection() {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Hiệu ứng typing
  useEffect(() => {
    const target = taglines[currentTagline];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < target.length) {
            setDisplayText(target.substring(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(target.substring(0, displayText.length - 1));
          } else {
            setIsDeleting(false);
            setCurrentTagline((prev) => (prev + 1) % taglines.length);
          }
        }
      },
      isDeleting ? 30 : 60
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTagline]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-pattern" />

      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--primary)] rounded-full opacity-[0.04] blur-[100px] animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)] rounded-full opacity-[0.04] blur-[100px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[120px] animate-spin-slow"
        style={{
          background:
            'conic-gradient(from 0deg, var(--primary), var(--accent), var(--primary))',
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in text-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[var(--muted-fg)]">
            Được xây dựng bởi AI, dành cho người Việt 🇻🇳
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up">
          Biến ý tưởng thành
          <br />
          <span className="gradient-text">{displayText}</span>
          <span className="inline-block w-[3px] h-[0.9em] bg-[var(--primary)] ml-1 animate-pulse align-middle" />
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--muted-fg)] max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
          Nền tảng tạo ảnh và video AI đầu tiên được thiết kế riêng cho thị
          trường Việt Nam. Chỉ cần mô tả bằng tiếng Việt.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link
            href="/dashboard"
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 group"
            id="hero-cta-start"
          >
            Bắt đầu sáng tạo
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#how-it-works"
            className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2"
            id="hero-cta-demo"
          >
            <Play className="w-4 h-4" />
            Xem cách hoạt động
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in-up delay-500">
          {[
            { value: '10+', label: 'Phong cách' },
            { value: '< 10s', label: 'Tạo ảnh' },
            { value: '100%', label: 'Tiếng Việt' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--muted-fg)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </section>
  );
}
