/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Externalize puppeteer and chromium packages to prevent bundling issues in serverless
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
}

module.exports = nextConfig

