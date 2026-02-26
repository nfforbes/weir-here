import { Auth0Client } from '@auth0/nextjs-auth0/server';
import type { SessionData } from '@auth0/nextjs-auth0';

/**
 * Trim session for cookie size (avoid "Request Header Or Cookie Too Large").
 * We only need user + internal; tokens are not used for API calls from this app.
 */
async function beforeSessionSaved(
  session: SessionData,
  _idToken: string | null
): Promise<SessionData> {
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year
  return {
    ...session,
    tokenSet: {
      accessToken: '',
      expiresAt,
    },
    accessTokens: [],
  };
}

export const auth0 = new Auth0Client({
  includeIdTokenHintInOIDCLogoutUrl: false,
  beforeSessionSaved,
});
