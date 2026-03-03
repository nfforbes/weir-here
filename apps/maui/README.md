# Weir Here – .NET MAUI

Mobile app for Weir Here, built with .NET MAUI (.NET 8). Replaces the previous Expo/React Native app.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [.NET MAUI workload](https://learn.microsoft.com/en-us/dotnet/maui/get-started/installation):  
  `dotnet workload install maui`
- For Android: Android SDK (via Visual Studio or command line)
- For iOS: macOS with Xcode (Mac only)

## Configuration

Edit `Services/Config.cs` (or use a build-time/config file) to set:

- **ApiBaseUrl** – Backend API base URL (e.g. `http://localhost:3000` for dev, or your Netlify/web URL).
- **Auth0Domain** – Auth0 tenant domain (e.g. `your-tenant.auth0.com`).
- **Auth0ClientId** – Auth0 native/public application client ID.
- **Auth0Audience** – Optional API audience.

For Auth0, configure a **Native** (or **Single Page**) application in the Auth0 dashboard and add the callback URL:

- **Callback URL**: `weirhere://callback`
- **Logout URL**: `weirhere://callback`

## Build and run

From this folder (`apps/maui`):

```bash
# Restore
dotnet restore

# Run on default platform (e.g. Windows if on Windows)
dotnet build -t:Run

# Run on Android (with emulator or device)
dotnet build -f net8.0-android -t:Run

# Run on iOS (Mac only)
dotnet build -f net8.0-ios -t:Run

# Run on Windows
dotnet build -f net8.0-windows10.0.19041.0 -t:Run
```

Or open `WeirHere.Maui.csproj` in Visual Studio 2022 and run from there.

## Structure

- **Models** – DTOs (e.g. `Job`) matching the API.
- **Services** – `IApiService`/`ApiService` (HTTP client), `IAuthService`/`AuthService` (Auth0 via `WebAuthenticator` and secure storage).
- **ViewModels** – MVVM with CommunityToolkit.Mvvm (Main, Login, Jobs, JobDetail, Dashboard).
- **Views** – XAML pages; Shell handles navigation (main, login, jobs, jobdetail, dashboard).
- **Platforms/Android** – `WebAuthenticationCallbackActivity` for `weirhere://` callback.

## Auth0 note

The app uses the OAuth2 authorization code flow with `WebAuthenticator`. For production, use PKCE and/or a backend to exchange the code for tokens if your Auth0 app is configured that way. With no Auth0 config, the app uses a dev token so you can still hit local APIs.
