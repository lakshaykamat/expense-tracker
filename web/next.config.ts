import type { NextConfig } from 'next'
// @ts-ignore
const withPWA = require('next-pwa')

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
