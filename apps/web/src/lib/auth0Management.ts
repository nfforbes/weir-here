export const AUTH0_TENANT_DOMAIN = 'weirherestaffing.us.auth0.com';
export const AUTH0_DB_CONNECTION = 'Username-Password-Authentication';

export type Auth0Identity = {
  connection?: string;
  provider?: string;
  user_id?: string;
  isSocial?: boolean;
};

export async function getAuth0ManagementToken(): Promise<string> {
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Account management is not configured.');
  }
  const res = await fetch(`https://${AUTH0_TENANT_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${AUTH0_TENANT_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Could not reach the sign-in account service.');
  }
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error('Could not reach the sign-in account service.');
  }
  return body.access_token;
}

export function hasDatabasePasswordIdentity(
  identities: Auth0Identity[] | undefined,
  userId?: string,
): boolean {
  if (identities?.some((identity) => identity.connection === AUTH0_DB_CONNECTION)) {
    return true;
  }
  return Boolean(userId?.startsWith('auth0|'));
}

export async function getAuth0User(userId: string): Promise<{
  email?: string;
  identities?: Auth0Identity[];
} | null> {
  const token = await getAuth0ManagementToken();
  const res = await fetch(
    `https://${AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}?fields=email,identities&include_fields=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Could not load the sign-in account.');
  }
  return (await res.json()) as { email?: string; identities?: Auth0Identity[] };
}

export async function verifyAuth0DatabasePassword(
  email: string,
  password: string,
): Promise<boolean> {
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Password change is not configured.');
  }
  const res = await fetch(`https://${AUTH0_TENANT_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      username: email,
      password,
      client_id: clientId,
      client_secret: clientSecret,
      realm: AUTH0_DB_CONNECTION,
      scope: 'openid',
    }),
    cache: 'no-store',
  });
  if (res.ok) return true;
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (body.error === 'invalid_grant' || body.error === 'invalid_user_password') {
    return false;
  }
  throw new Error('Could not verify the current password.');
}

export async function updateAuth0Password(userId: string, password: string): Promise<void> {
  const token = await getAuth0ManagementToken();
  const res = await fetch(
    `https://${AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        password,
        connection: AUTH0_DB_CONNECTION,
      }),
      cache: 'no-store',
    },
  );
  if (res.ok) return;
  const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
  throw new Error(body.message || body.error || 'Could not update the password.');
}
