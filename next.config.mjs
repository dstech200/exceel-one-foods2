/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xmuogagalwlwgdydrjmu.supabase.co', // your external domain
        port: '', // leave empty unless needed
        pathname: '/**', // allow all image paths
      },
      {
        protocol: 'https',
        hostname: 'another-domain.com',
        pathname: '/images/**', // optional: specific path
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
