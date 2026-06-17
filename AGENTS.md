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
│   │   ├── api/admitto/        # Server-side proxy for Admitto API calls
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
| `ADMITTO_API_KEY` | **Server-only** (private) | API key for Admitto. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_ADMITTO_URL` | Public | Base URL of the Admitto service (inlined at build time). Defaults to `https://admitto.sandermolenkamp.com`. |

## Admitto API key architecture

The `ADMITTO_API_KEY` must never be exposed in the browser bundle.

- **Client-side calls** (from `'use client'` components): call functions in `src/api/admitto.ts`
  which route through the Next.js proxy at `/api/admitto/[...path]`. The proxy runs server-side
  and adds the `X-ApiKey` header before forwarding to Admitto.
- **Server-side calls** (from server components and API routes): call Admitto directly using the
  `getApiHeaders()` helper in `admitto.ts` which reads `process.env.ADMITTO_API_KEY`.

Never use `NEXT_PUBLIC_ADMITTO_API_KEY` — that would expose the key in the browser.

## Build and deploy

```bash
cd src-react
pnpm install
pnpm build   # production build
```

Deployment is automatic on push to `main` via `.github/workflows/main_bitbash.yml`.
The workflow builds the Next.js app, bundles it, and deploys to Azure Web App (`bitbash`).

## Key configuration file

`src-react/src/config/website-settings.ts` is the central place for edition dates,
registration windows, Admitto slugs, speaker/schedule announcements, and past editions.
