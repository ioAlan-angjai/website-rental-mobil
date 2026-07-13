/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize framer-motion: only ship the features we use
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

module.exports = nextConfig;
