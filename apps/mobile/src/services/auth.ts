import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '../config';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'weir_here_token';
const REFRESH_KEY = 'weir_here_refresh';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
  tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
  revocationEndpoint: `https://${AUTH0_DOMAIN}/oauth/revoke`,
};

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'weirhere' });

export async function login(): Promise<{ accessToken: string; idToken?: string } | null> {
  const request = new AuthSession.AuthRequest({
    clientId: AUTH0_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: { audience: `https://${AUTH0_DOMAIN}/api/v2/` },
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== 'success' || !result.params.code) {
    return null;
  }

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId: AUTH0_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    discovery,
  );

  await SecureStore.setItemAsync(TOKEN_KEY, tokenResult.accessToken);
  if (tokenResult.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, tokenResult.refreshToken);
  }

  return {
    accessToken: tokenResult.accessToken,
    idToken: tokenResult.idToken ?? undefined,
  };
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);

  const returnTo = AuthSession.makeRedirectUri({ scheme: 'weirhere' });
  await WebBrowser.openAuthSessionAsync(
    `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`,
    returnTo,
  );
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}
