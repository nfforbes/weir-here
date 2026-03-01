import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@weir-here/shared'],
  // Explicitly expose these to the Edge runtime (middleware).
  // Next.js only inlines env vars it can statically detect in *your* code;
  // vars read inside third-party SDK bundles (Auth0) are invisible to the
  // analyser and therefore undefined at Edge runtime without this.
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
