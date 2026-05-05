// ============================================================
// ezGen — Landing Page (Trang chủ)
// Hero section + Feature highlights + Demo section
// ============================================================

import HeroSection from '@/components/hero/HeroSection';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Zap,
  Globe,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-24 px-4 relative" id="features">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
              Tính năng nổi bật
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mọi thứ bạn cần để{' '}
              <span className="gradient-text">sáng tạo với AI</span>
            </h2>
            <p className="text-[var(--muted-fg)] max-w-2xl mx-auto">
              ezGen tích hợp các công nghệ AI tiên tiến nhất, được tinh chỉnh
              riêng cho người dùng Việt Nam
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass card-interactive rounded-2xl p-6 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'forwards' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feature.iconBg }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 dot-grid" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
              Cách hoạt động
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Từ ý tưởng đến tác phẩm trong{' '}
              <span className="gradient-text">3 bước</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 200}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--muted-fg)]">
                  {step.description}
                </p>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-[var(--primary)]/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4" id="cta">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)] rounded-full opacity-5 blur-3xl" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Sẵn sàng sáng tạo{' '}
              <span className="gradient-text">cùng AI?</span>
            </h2>
            <p className="text-[var(--muted-fg)] mb-8 relative z-10">
              Bắt đầu miễn phí ngay hôm nay. Không cần thẻ tín dụng.
            </p>
            <Link
              href="/dashboard"
              className="btn-primary text-base px-8 py-3 inline-block relative z-10"
              id="cta-start"
            >
              Bắt đầu sáng tạo miễn phí 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--muted-fg)]">
              © 2026 ezGen. Được xây dựng với ❤️ tại Việt Nam.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--muted-fg)]">
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Bảo mật
            </a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Data
// ============================================================

const features = [
  {
    title: 'Trợ lý Thư 🇻🇳',
    description:
      'AI hiểu sâu ngữ nghĩa, từ lóng và bối cảnh văn hóa Việt Nam. Mô tả bằng tiếng Việt, Thư sẽ tối ưu prompt cho bạn.',
    icon: Sparkles,
    iconBg: 'rgba(124, 92, 252, 0.15)',
    iconColor: '#7c5cfc',
  },
  {
    title: 'Tạo Ảnh AI',
    description:
      'Hỗ trợ nhiều engine: Stable Diffusion, Flux, Imagen 3. Bộ lọc phong cách: Chân thực, Hoạt hình, Hội họa Việt Nam.',
    icon: ImageIcon,
    iconBg: 'rgba(0, 212, 170, 0.15)',
    iconColor: '#00d4aa',
  },
  {
    title: 'Tạo Video AI',
    description:
      'Sắp ra mắt! Tích hợp Runway Gen-3, Luma Dream Machine và Kling AI để chuyển ảnh tĩnh thành video sống động.',
    icon: Video,
    iconBg: 'rgba(255, 159, 67, 0.15)',
    iconColor: '#ff9f43',
  },
  {
    title: 'Tốc độ cao',
    description:
      'Tối ưu hóa pipeline xử lý. Ảnh được tạo trong vài giây, video trong vài phút.',
    icon: Zap,
    iconBg: 'rgba(255, 107, 107, 0.15)',
    iconColor: '#ff6b6b',
  },
  {
    title: 'Bản địa hóa',
    description:
      'Giao diện hoàn toàn tiếng Việt. Hiểu phong cảnh phố cổ, áo dài, hoa sen và mọi yếu tố văn hóa Việt.',
    icon: Globe,
    iconBg: 'rgba(84, 160, 255, 0.15)',
    iconColor: '#54a0ff',
  },
  {
    title: 'An toàn & Bảo mật',
    description:
      'API key được bảo vệ server-side. Không lưu trữ dữ liệu cá nhân. Tác phẩm thuộc về bạn.',
    icon: Shield,
    iconBg: 'rgba(200, 130, 255, 0.15)',
    iconColor: '#c882ff',
  },
];

const steps = [
  {
    title: 'Mô tả ý tưởng',
    description:
      'Nhập mô tả bằng tiếng Việt. Ví dụ: "Cô gái mặc áo dài đi dưới mưa ở phố cổ Hội An"',
  },
  {
    title: 'Thư tối ưu',
    description:
      'Trợ lý Thư phân tích ý tưởng và tạo prompt kỹ thuật chuyên sâu bằng tiếng Anh.',
  },
  {
    title: 'Nhận tác phẩm',
    description:
      'AI tạo ảnh chất lượng cao trong vài giây. Tải xuống, chia sẻ hoặc nâng cấp lên video.',
  },
];
