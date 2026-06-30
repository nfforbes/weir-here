# Weir Here — Kotlin Multiplatform mobile app (`apps/kt`)

Shared UI and networking target **Android** (Compose + Auth0 SDK) and **iOS** (Compose + Auth0 PKCE via ASWebAuthenticationSession).

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

- **Env:** `Env.ios.kt` is generated from `apps/kt/local.properties` (same keys as Android) on each iOS Gradle build.
- **Auth:** Native Auth0 PKCE via `ASWebAuthenticationSession` in `iosApp/iosApp/Auth0Manager.swift`, wired to Compose through `IosAuthBridge.kt`. Callback: `weirhere://callback`.
- **Info.plist** registers the **`weirhere`** URL scheme and relaxes ATS for local debugging.

## App behavior (aligned with web)

- **Browse** — public job list (`GET /api/jobs`).
- **Payment** — secure payment portal with PayPal Hosted Button (mirrors web `/payment`).
- **Admin** — administrators only (`hasAdministrator`); job/provider/client management.
- **Provider** — providers only (`hasProvider`); assignments portal.
- **Profile** — Auth0 login (Android + iOS), logout, bootstrap-driven email/personas (top-bar icon).
