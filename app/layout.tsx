// ============================================================
// ezGen Creative Suite AI — Root Layout
// Dark theme, Vietnamese SEO, Inter font
// ============================================================

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "ezGen — Nền tảng Sáng tạo AI cho người Việt",
  description:
    "Biến ý tưởng thành tác phẩm nghệ thuật AI. Tạo ảnh và video AI chất lượng cao với trợ lý thông minh Thư, được thiết kế riêng cho người Việt Nam.",
  keywords: [
    "AI image generation",
    "tạo ảnh AI",
    "creative suite",
    "Việt Nam",
    "ezGen",
    "trí tuệ nhân tạo",
  ],
  openGraph: {
    title: "ezGen — Sáng tạo AI cho người Việt",
    description: "Tạo ảnh và video AI chất lượng cao với trợ lý Thư",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
