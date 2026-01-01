import type { NextConfig } from 'next'
// @ts-ignore
const withPWA = require('next-pwa')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations (SWC minification is enabled by default in Next.js 16)
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',

  // 🔒 CRITICAL: do NOT cache navigation / HTML
  runtimeCaching: [],

  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig)
