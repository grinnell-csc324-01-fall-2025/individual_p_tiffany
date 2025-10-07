/**
 * Next.js config with a development-only proxy to avoid CORS/mixed-content during local dev.
 * Requests to /api/** will be proxied to http://localhost:8000/** when running in development.
 */
const dev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (dev) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
