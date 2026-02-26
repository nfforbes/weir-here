import { Auth0Client } from '@auth0/nextjs-auth0/server';
import type { SessionData } from '@auth0/nextjs-auth0/types';

/**
 * Trim session for cookie size (avoid "Request Header Or Cookie Too Large").
 * We only need user (sub, name, email, email_verified) + internal; tokens are not used.
 */
async function beforeSessionSaved(
  session: SessionData,
  _idToken: string | null
): Promise<SessionData> {
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year
  const { user } = session;
  return {
    user: {
      sub: user.sub,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
    },
    tokenSet: {
      accessToken: '',
      expiresAt,
    },
    internal: session.internal,
    accessTokens: [],
  };
}

export const auth0 = new Auth0Client({
  includeIdTokenHintInOIDCLogoutUrl: false,
  beforeSessionSaved,
});
