/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // PWA support for mobile
  experimental: {
    // optimizeCss: true,
  },
}

module.exports = nextConfig
