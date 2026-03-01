import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL: string =
  extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export const AUTH0_DOMAIN: string =
  extra.auth0Domain ?? process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';

export const AUTH0_CLIENT_ID: string =
  extra.auth0ClientId ?? process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';
