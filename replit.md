# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Authentication**: Clerk with branded in-app sign-in/sign-up screens

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **Partes de Técnicos / SCANIA** (`artifacts/partes-tecnicos`) — React/Vite web app at `/` for technicians to submit overtime and service activity reports in Spanish. Includes mobile-friendly report form, automatic totals, technician-only history, supervisor dashboard, and review surface.
- **API Server** (`artifacts/api-server`) — Express API mounted at `/api` with authenticated profile and report routes.
- **Canvas** (`artifacts/mockup-sandbox`) — design/mockup sandbox.

## Data Model

- `user_profiles` stores authenticated user profiles by Clerk user ID, display name, email, and role (`technician` or `supervisor`).
- `service_reports` stores technician reports with owner user fields, 50% and 100% overtime split by normal days and weekend/holiday categories, `+40km` variants, `solo +40km` hours, technical assistance guard, field activations, notes, review state, and timestamps.

## API Surface

- `GET /api/profile` — get or create the authenticated user profile.
- `PATCH /api/profile` — update display name and role.
- `GET /api/service-reports` — list reports visible to the authenticated user; technicians see only their own reports, supervisors see all.
- `POST /api/service-reports` — create a report assigned to the authenticated user.
- `PATCH /api/service-reports/{id}` — update review state and notes; supervisor role required.
- `GET /api/service-reports/summary` — dashboard totals and review counts scoped to the authenticated user role.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
