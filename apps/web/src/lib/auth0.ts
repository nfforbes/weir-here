import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Explicitly reference each env var in our own code so Next.js static analysis
// inlines them into the Edge bundle used by middleware.
export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl:
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://localhost:3000'),
});
