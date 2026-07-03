# AGENTS.md — Bitbash project guide for AI agents

## Project structure

```
Bitbash/
├── src/                        # .NET backend (session import, models)
│   ├── Bitbash.Models/
│   ├── Bitbash.SessionizeImport/
│   └── Bitbash.Web/
├── src-react/                  # Next.js frontend (main website)
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/tickets/        # Server-side proxy for Admitto API calls
│   │   └── (default)/          # Public-facing pages
│   ├── src/
│   │   ├── api/admitto.ts      # All Admitto API call functions
│   │   ├── components/         # React components (forms, layout, etc.)
│   │   └── config/             # website-settings.ts — central configuration
│   └── public/                 # Static assets
└── .github/workflows/          # CI/CD — builds and deploys to Azure Web App
```

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, React, Bootstrap
- **Package manager:** pnpm
- **Deployment:** Azure Web App (via GitHub Actions)
- **Ticketing:** Admitto API (external service)

## Environment variables

| Variable | Scope | Description |
|---|---|---|
| `ADMITTO_API_KEY` | **Server-only** (private) | Partner API key for Admitto. Never prefix with `NEXT_PUBLIC_`. |
| `ADMITTO_URL` | **Server-only** | Base URL of the Admitto service. Defaults to `https://admitto.sandermolenkamp.com`. |
| `ADMITTO_EVENT_SLUG` | **Server-only** | Admitto event slug. Defaults to `bitbash-2027`. |
| `ADMITTO_MAIN_CONFERENCE_TICKET_TYPE_NAME` | **Server-only** | Display name of the main conference ticket type. |
| `ADMITTO_IGNORED_TICKET_TYPE_IDS` | **Server-only** | Optional comma-separated ticket type UUIDs hidden from the website. |

## Admitto API key architecture

The `ADMITTO_API_KEY` must never be exposed in the browser bundle.

- **Client-side calls** (from `'use client'` components): call functions in `src/api/admitto.ts`
  which route through Bitbash-specific Next.js API routes under `/api/tickets/*`.
- **Server-side calls** (from server components and API routes): call Admitto through
  `src/lib/admitto.server.ts`, which reads server-only settings and sends `X-Api-Key`.

Never use `NEXT_PUBLIC_ADMITTO_API_KEY` or `NEXT_PUBLIC_ADMITTO_URL` — those expose Admitto details in the browser bundle.

## Build and deploy

```bash
cd src-react
pnpm install
pnpm build   # production build
```

Deployment is automatic on push to `main` via `.github/workflows/main_bitbash.yml`.
The workflow builds the Next.js app, bundles it, and deploys to Azure Web App (`bitbash`).

## Key configuration file

`src-react/src/config/website-settings.ts` is the central place for public edition dates,
registration windows, speaker/schedule announcements, and past editions. Admitto connection
settings live in `src-react/src/config/admitto-settings.server.ts`.
