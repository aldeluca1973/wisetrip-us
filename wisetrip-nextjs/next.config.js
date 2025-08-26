/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'supabase.co'],
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['leaflet']
  },
  output: 'standalone'
}

module.exports = nextConfig