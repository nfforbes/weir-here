# Weir Here Staffing Platform

A full-stack staffing agency platform built with Next.js 15, MongoDB, Auth0, Material UI, Redux-Saga, and a .NET MAUI mobile app.

## Architecture

```
weir-here-v2/
├── apps/
│   ├── web/          # Next.js 15 web application
│   ├── mobile/       # (Legacy) Expo React Native mobile app
│   └── maui/         # .NET MAUI mobile app (current)
├── packages/
│   └── shared/       # Shared types, constants, and utilities
├── package.json      # Root workspace config
└── README.md
```

## Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Web         | Next.js 15 (App Router), React 19             |
| Mobile      | .NET MAUI (.NET 8); legacy Expo/React Native in `apps/mobile` |
| UI          | Material UI 6, Emotion (web); MAUI XAML (mobile) |
| State       | Redux Toolkit + Redux-Saga (web); MVVM (mobile) |
| Auth        | Auth0 (nextjs-auth0 for web; WebAuthenticator for MAUI) |
| Database    | MongoDB via Mongoose                          |
| Storage     | Microsoft 365 SharePoint (Graph API)          |
| Language    | TypeScript (web, shared); C# (MAUI)            |

## Personas

| Persona       | Access                                                |
| ------------- | ----------------------------------------------------- |
| Visitor       | Public pages, job board (read-only)                   |
| User          | Apply for jobs, post jobs, review applications        |
| Administrator | All user permissions + system settings, user management |

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB instance (local or Atlas)
- Auth0 account with configured application

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example apps/web/.env.local
```

Required environment variables:

```
AUTH0_SECRET=<random 32+ char string>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_DOMAIN.auth0.com
AUTH0_CLIENT_ID=<your Auth0 client ID>
AUTH0_CLIENT_SECRET=<your Auth0 client secret>
MONGODB_URI=mongodb://localhost:27017/weir-here
```

### Auth0 Configuration

1. Create an Auth0 application (Regular Web Application)
2. Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
3. Set Allowed Logout URLs: `http://localhost:3000`
4. Set Allowed Web Origins: `http://localhost:3000`
5. Enable Email Verification in Auth0 dashboard

### Installation

```bash
# From the repository root
npm install

# Start the web development server
npm run dev

# Or start the mobile app (Expo – legacy)
npm run dev:mobile
```

To run the **.NET MAUI mobile app**, see `apps/maui/README.md` (requires .NET 8 and MAUI workload).

### MS365 / SharePoint Configuration

MS365 settings are configured through the admin settings UI (`/dashboard/admin/settings`) and stored in MongoDB. An administrator must configure:

- `MS365_CLIENT_ID` - Azure AD application client ID
- `MS365_CLIENT_SECRET` - Azure AD application client secret
- `MS365_TENANT_ID` - Azure AD tenant ID
- `MS365_SHAREPOINT_SITE_ID` - SharePoint site ID
- `MS365_RESUME_FOLDER_PATH` - SharePoint folder for resumes
- `MS365_LOGO_FOLDER_PATH` - SharePoint folder for logos
- `MS365_JOB_ATTACHMENT_PATH` - SharePoint folder for job attachments

## Key Features

### For Job Seekers
- Browse and search the job board by keyword, category, location, and tags
- View detailed job postings with requirements and screening questions
- Apply to jobs with resume upload and screening question responses

### For Employers
- Post jobs with comprehensive details (description, requirements, salary, etc.)
- Add optional screening questions (yes/no or text)
- Specify reviewer emails for collaborative applicant evaluation
- Review applications with decimal ratings (0-10) and elimination flags

### For Administrators
- Configure MS365/SharePoint integration settings
- Manage users and system settings
- Full access to all platform features

## API Routes

| Route                        | Methods         | Description                    |
| ---------------------------- | --------------- | ------------------------------ |
| `/api/auth/[auth0]`         | GET             | Auth0 authentication handlers  |
| `/api/auth/me`              | GET             | Current user session           |
| `/api/users/bootstrap`      | POST            | User profile bootstrap         |
| `/api/jobs`                 | GET, POST       | Job listing and creation       |
| `/api/jobs/[id]`            | GET, PUT, DELETE| Single job CRUD                |
| `/api/applications`         | GET, POST       | Application listing and submit |
| `/api/applications/[id]`    | GET, PATCH      | Application detail and status  |
| `/api/reviews`              | GET, POST       | Review listing and submission  |
| `/api/invites`              | GET, POST       | Reviewer invite management     |
| `/api/admin/settings`       | GET, PUT        | Admin system settings          |
| `/api/upload`               | POST            | File upload to SharePoint      |

## Theming

The application uses MUI's theming system. The primary theme uses:
- **Deep Navy** (`#0a1929`) - Top banner, dark accents
- **Electric Blue** (`#1976d2`) - Primary color, navigation
- **Black** - Footer background

Theme can be customized in `apps/web/src/theme/theme.ts`.

## Development

```bash
# Run web app in development
npm run dev

# Run mobile app (Expo – legacy)
npm run dev:mobile

# MAUI mobile: see apps/maui/README.md (dotnet build -t:Run)

# Lint
npm run lint

# Build for production
npm run build
```
