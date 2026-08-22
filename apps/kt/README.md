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

2. In the **Auth0 Dashboard** → your **Native** application (mobile client id):
   - **Allowed Callback URLs** — include:
     ```
     weirhere://callback
     ```
   - **Allowed Logout URLs** — include the same value (required for logout redirect back into the app):
     ```
     weirhere://callback
     ```
   - Optionally also add the Android SDK default form:
     ```
     weirhere://n4consulting.us.auth0.com/android/com.weirhere.mobile/callback
     ```
   - **Allowed Origins (CORS)** is not required for the native custom-scheme flow.

3. Build from `apps/kt`:
   ```bash
   ./gradlew :androidApp:assembleDebug
   ```

4. **Release / Play Store signing (local or CI):** set these env vars (or Gradle `-P` props) before `./gradlew :androidApp:bundleRelease`:
   - `ANDROID_KEYSTORE_PATH` — path to the upload keystore
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - Optional: `VERSION_CODE`, `VERSION_NAME`

## CI — Google Play deploy

Workflow: [`.github/workflows/kotlin-android.yml`](../../.github/workflows/kotlin-android.yml)

- **PRs:** debug APK build (no signing secrets required)
- **Push to `main`/`master` (and manual dispatch):** signed release AAB + upload to Play Console (`internal` track by default)

### Required GitHub secrets

| Secret | Purpose |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the upload keystore (`base64 -w0 release.keystore`) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAY_STORE_JSON_KEY` | Full JSON for a Play Console API service account with release access to `com.weirhere.mobile` |

Shared with the iOS workflow (optional but recommended): `WEIR_HERE_AUTH0_DOMAIN`, `WEIR_HERE_AUTH0_CLIENT_ID`, `WEIR_HERE_AUTH0_AUDIENCE`, `WEIR_HERE_API_URL`.

Play Console: create a service account in Google Cloud, grant it **Release manager** (or equivalent) in Play Console → Users and permissions, then paste the JSON key into `PLAY_STORE_JSON_KEY`. The app listing for package `com.weirhere.mobile` must already exist (at least a draft).

Manual run: Actions → **Kotlin Android Build** → Run workflow (choose track: `internal`, `alpha`, `beta`, or `production`).

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
