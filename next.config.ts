import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép load ảnh từ các domain bên ngoài (image engines)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: '*.fal.ai' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
    ],
  },
};

export default nextConfig;
