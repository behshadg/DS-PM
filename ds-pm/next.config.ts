// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb' // Add this line to fix the type
    },
    optimizePackageImports: [
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select'
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig