import type { JWTPayload } from 'jose';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { auth0 } from '@/lib/auth0';

/** Identity shape used across API routes (cookie session or Bearer JWT). */
export type ApiAuthUser = {
  sub: string;
  email?: string | undefined;
  emailVerified: boolean;
  name?: string | undefined;
};

function getIssuer(): string | null {
  const domain = process.env.AUTH0_DOMAIN?.trim();
  return domain ? `https://${domain}/` : null;
}

// Hard-coded mobile client ID as a safety fallback so JWT validation works
// even if the Vercel env var is temporarily missing or stale.
const MOBILE_CLIENT_ID_FALLBACK = '7gvIVgyZkkGlws8kMjhzS47mmoBnXaFb';

function bearerAudiences(): string[] {
  const a = [
    process.env.AUTH0_AUDIENCE,
    process.env.AUTH0_MOBILE_CLIENT_ID,
    MOBILE_CLIENT_ID_FALLBACK,
    process.env.AUTH0_CLIENT_ID,
  ].map((x) => (typeof x === 'string' ? x.trim() : ''));
  return [...new Set(a.filter(Boolean))];
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  const issuer = getIssuer();
  if (!issuer) return null;
  if (!jwks) {
    const url = `${issuer}.well-known/jwks.json`;
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

/**
 * Validates an Auth0-issued Bearer JWT against JWKS. Tries each configured audience
 * (custom API identifier, Native client id, SPA client id).
 */
async function verifyAuth0Jwt(authHeader: string | null): Promise<JWTPayload | null> {
  if (!authHeader?.toLowerCase().startsWith('bearer ')) return null;
  const token = authHeader.slice('bearer '.length).trim();
  if (!token) return null;
  const issuer = getIssuer();
  const JWKS = getJwks();
  if (!issuer || !JWKS) return null;

  const audiences = bearerAudiences();
  if (audiences.length === 0) return null;

  let lastErr: unknown;
  for (const audience of audiences) {
    try {
      const { payload } = await jwtVerify(token, JWKS, { issuer, audience });
      return payload;
    } catch (e) {
      lastErr = e;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('[apiAuth] JWT verify failed for all audiences:', lastErr);
  }
  return null;
}

async function jwtPayloadToUser(
  payload: JWTPayload,
  rawBearerToken: string,
): Promise<ApiAuthUser | null> {
  const domain = process.env.AUTH0_DOMAIN?.trim();
  let sub =
    typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  if (!sub || !domain) return null;

  let email =
    typeof payload.email === 'string' ? payload.email : undefined;

  let emailVerified = typeof payload.email_verified === 'boolean' ? payload.email_verified : false;

  let name: string | undefined =
    typeof payload.name === 'string'
      ? payload.name
      : typeof payload.nickname === 'string'
        ? payload.nickname
        : undefined;

  /** Access tokens often omit claims; fallback to OIDC `/userinfo` with the same bearer */
  if (!email || !name) {
    try {
      const res = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${rawBearerToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const info = (await res.json()) as Record<string, unknown>;
        const e = typeof info.email === 'string' ? info.email : undefined;
        if (e) email = e;
        if (typeof info.email_verified === 'boolean') emailVerified = info.email_verified;
        const n =
          typeof info.name === 'string'
            ? info.name
            : typeof info.nickname === 'string'
              ? info.nickname
              : undefined;
        if (n) name = n;
      }
    } catch {
      // Ignore userinfo fallback failure
    }
  }

  return {
    sub,
    email: email?.trim(),
    emailVerified,
    name,
  };
}

/**
 * Prefer encrypted session cookie (web browser). Otherwise validate `Authorization: Bearer`
 * for Native / mobile clients against Auth0 JWKS (RS256).
 */
export async function getApiAuthUser(request: Request): Promise<ApiAuthUser | null> {
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      return {
        sub: session.user.sub,
        email: session.user.email,
        emailVerified: Boolean(session.user.email_verified),
        name:
          typeof session.user.name === 'string' ? session.user.name : undefined,
      };
    }
  } catch {
    // Fail open to Bearer path
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.toLowerCase().startsWith('bearer ') || bearerAudiences().length === 0) {
    return null;
  }

  const token = authHeader.slice('bearer '.length).trim();
  const payload = await verifyAuth0Jwt(authHeader);
  if (!payload) {
    return null;
  }
  const user = await jwtPayloadToUser(payload, token);
  return user;
}
