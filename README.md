# Weir Here - Staffing Agency Platform

A full-stack staffing agency web application built with Next.js 16, Material UI, Auth0, MongoDB, and Microsoft 365 SharePoint integration. Includes a companion React Native mobile app.

## Tech Stack

- **Web:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Material UI 7, Emotion
- **State:** Redux Toolkit + Redux-Saga (client-side)
- **Auth:** Auth0 (nextjs-auth0 v4)
- **Database:** MongoDB via Mongoose
- **File Storage:** MS365 SharePoint via Microsoft Graph
- **Mobile:** React Native / Expo

## Prerequisites

- Node.js 20.9+ (recommended: Node 25)
- MongoDB instance
- Auth0 account and application
- Microsoft 365 / SharePoint (optional, for file uploads)

## Getting Started

### Web Application

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Auth0 and MongoDB credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Mobile Application

```bash
cd mobile

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API URL and Auth0 credentials

# Run on Android/iOS
npm run android
npm run ios
```

## Environment Variables

### Web (.env.local)

| Variable | Description |
|----------|-------------|
| `AUTH0_SECRET` | Random string for session encryption (32+ chars) |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `APP_BASE_URL` | Application URL (e.g. http://localhost:3000) |
| `MONGODB_URI` | MongoDB connection string |

### Mobile (.env)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Next.js API URL |
| `EXPO_PUBLIC_AUTH0_DOMAIN` | Auth0 domain |
| `EXPO_PUBLIC_AUTH0_CLIENT_ID` | Auth0 native client ID |

## Features

- **Authentication:** Auth0 login/logout with email verification
- **Personas:** Administrator, User, Visitor - permission-based menu visibility
- **Job Board:** Search by keyword, category, location, tags with pagination
- **Company Management:** Register multiple companies with logo upload
- **Job Posting:** Full job creation with screening questions, skills, benefits
- **Applications:** Resume upload, screening answers, reviewer assignment
- **Review System:** Rate applicants 0-10, mark as eliminated
- **Admin Panel:** Configure MS365 SharePoint integration credentials
- **Theming:** Light/dark mode toggle
- **Responsive:** Full mobile responsiveness with MUI breakpoints
- **Mobile App:** React Native/Expo with same API backend

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/                  # REST API endpoints
      auth/               # Auth0 handler
      admin/settings/     # Admin MS365 config
      companies/          # Company CRUD
      jobs/               # Job CRUD + applications
      applications/       # Application submission
      reviews/            # Applicant reviews
      upload/             # File upload to SharePoint
      invites/            # Reviewer invitations
    dashboard/            # Authenticated dashboard pages
    jobs/                 # Public job board pages
    about-us/             # About page
    contact-us/           # Contact page
    solutions/            # Solutions pages
    industries/           # Industries page
    admin/                # Admin pages
  components/             # React components
    layout/               # Banner, Footer, AppShell
    pages/                # Page-level client components
    jobs/                 # Job board components
    dashboard/            # Dashboard components
    admin/                # Admin components
  lib/                    # Shared utilities
    auth.ts               # User session + DB sync
    auth0.ts              # Auth0 client instance
    mongodb.ts            # Database connection
    ms365.ts              # SharePoint upload service
    permissions.ts        # Menu + permission logic
  models/                 # Mongoose schemas
  store/                  # Redux store + sagas
  theme/                  # MUI theme configuration
  middleware.ts           # Auth0 middleware
mobile/                   # React Native / Expo app
```
