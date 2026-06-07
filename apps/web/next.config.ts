import type { NextConfig } from 'next';
import path from 'path';
import { loadEnvConfig } from '@next/env';

// Monorepo: Next.js only loads `.env*` from `apps/web` by default. If you keep
// `.env.local` at the repo root, load it here so Auth0 and `next.config` `env`
// see the same values.
const repoRoot = path.resolve(__dirname, '../..');
loadEnvConfig(repoRoot);
loadEnvConfig(__dirname);

// `next.config` `env` is bundled into the browser; never put secrets there.
// `compiler.defineServer` inlines into Node server and Edge (middleware) only,
// which fixes Auth0 in middleware — plain `env` + DefinePlugin was not replacing
// `process.env.*` inside the middleware bundle (secret stayed empty → skipped auth → 404 on /auth/login).
const auth0ServerEnv: Record<string, string> = {
  AUTH0_SECRET: process.env.AUTH0_SECRET ?? '',
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ?? '',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ?? '',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ?? '',
  APP_BASE_URL: process.env.APP_BASE_URL ?? '',
  VERCEL_URL: process.env.VERCEL_URL ?? '',
};

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /** Transpile Auth0 so the server bundle does not rely on a flaky `vendor-chunks/@auth0.js` split. */
  transpilePackages: ['@weir-here/shared', '@auth0/nextjs-auth0'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  compiler: {
    defineServer: Object.fromEntries(
      Object.entries(auth0ServerEnv).map(([key, value]) => [`process.env.${key}`, value]),
    ),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 450],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
