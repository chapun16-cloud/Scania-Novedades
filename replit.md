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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **Partes de Técnicos** (`artifacts/partes-tecnicos`) — React/Vite web app at `/` for technicians to submit overtime and service activity reports in Spanish. Includes mobile-friendly report form, automatic totals, and a dashboard/review surface.
- **API Server** (`artifacts/api-server`) — Express API mounted at `/api`.
- **Canvas** (`artifacts/mockup-sandbox`) — design/mockup sandbox.

## Data Model

- `service_reports` stores technician reports with 50% and 100% overtime split by normal days and weekend/holiday categories, `+40km` variants, `solo +40km`, technical assistance guard, field activations, notes, review state, and timestamps.

## API Surface

- `GET /api/service-reports` — list all reports.
- `POST /api/service-reports` — create a report.
- `PATCH /api/service-reports/{id}` — update review state and notes.
- `GET /api/service-reports/summary` — dashboard totals and review counts.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
