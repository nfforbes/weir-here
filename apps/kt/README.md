# Weir Here — Kotlin Multiplatform mobile app (`apps/kt`)

Shared UI and networking target **Android** (Compose + Auth0 SDK) and **iOS** (Compose with a stub Auth0 login; see below).

The Next.js backend under `apps/web` accepts **cookies** from the browser and **`Authorization: Bearer`** from native clients (`src/lib/apiAuth.ts`). Tokens must satisfy Auth0 JWKS verification and **`aud`** expectations (`AUTH0_AUDIENCE`, and optionally `AUTH0_MOBILE_CLIENT_ID`).

## Prerequisites

- **JDK 17**, Android SDK / Xcode as usual for KMP targets.
- A running **apps/web** API (default port `3000`).

## Android configuration

1. Copy `apps/kt/local.properties.example` to **`apps/kt/local.properties`** and set:
   - **`weir_here.api.url`** — use `http://10.0.2.2:3000` to reach `localhost` on the emulator; use `http://YOUR_LAN_IP:3000` for a physical device.
   - **`weir_here.auth0.domain`** — tenant domain (e.g. `dev-xxxx.us.auth0.com`).
   - **`weir_here.auth0.clientId`** — **Native Application** client id from Auth0 (PKCE-enabled).
   - **`weir_here.auth0.audience`** — same API identifier as **`AUTH0_AUDIENCE`** in `.env`.

2. In the **Auth0 Dashboard** → your Native application → **Allowed Callback URLs**, add the callback URIs expected by Auth0.Android for **`weirhere`** (scheme is registered in `AndroidManifest.xml`). Consult [Auth0 Android docs](https://auth0.com/docs/quickstart/native/android) for the exact pattern used by SDK 2.x.

3. Build from `apps/kt`:
   ```bash
   ./gradlew :androidApp:assembleDebug
   ```

## iOS notes

- **Env:** `Env.ios.kt` defaults to `http://127.0.0.1:3000` as the API base URL (Simulator can reach macOS localhost). Adjust for device testing.
- **Auth:** **`PlatformLoginButton`** on `iosMain` is a scaffold (no PKCE Browser flow yet); see `shared/src/iosMain/kotlin/com/weirhere/auth/PlatformLoginButton.ios.kt`. Add Auth0 Swift + ASWebAuthenticationSession and pass the resulting access token into `SessionStore.setAccess(token)` once implemented.
- **Info.plist** registers the **`weirhere`** URL scheme for future redirects and relaxes ATS for local debugging.

## App behavior (aligned with web)

- **Browse** — public job list (`GET /api/jobs`).
- **Mine** — `GET /api/jobs?mine=true` with Bearer (`/api/users/bootstrap` informs personas).
- **Post** — administrators only (`hasAdministrator`).
- **Profile** — Auth0 login (Android), logout, bootstrap-driven email/personas.
