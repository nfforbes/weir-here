import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Explicitly reference each env var in our own code so Next.js static analysis
// inlines them into the Edge bundle used by middleware.
// Secret must be a string (never undefined) to avoid "ikm must be Uint8Array or string" in Edge.
const secret = process.env.AUTH0_SECRET;
export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: typeof secret === 'string' ? secret : '',
  appBaseUrl:
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://localhost:3000'),
});
