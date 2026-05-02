# Workspace — SCANIA Partes Técnicos

## Overview

pnpm workspace monorepo using TypeScript. Spanish-language mobile app for Scania technicians/mechanics to submit overtime/service forms. Role-based access: technicians see own reports, supervisors see all.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Mobile**: Expo (React Native) with expo-router

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| `api-server` | `/api` | Express REST API, port 8080 |
| `mobile` | Expo dev domain | React Native / Expo app, port 18115 |
| `mockup-sandbox` | `/__mockup` | Canvas component preview server |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/mobile run dev` — run Expo app locally

## Architecture

### Auth
- **Web/Clerk routes** (`/api/profile`, `/api/service-reports`): use Clerk JWT auth
- **Mobile routes** (`/api/mobile/users`, `/api/mobile/reports`): auth via `displayName` validated against `allowed_users` table — no Clerk dependency on mobile

### DB Schema (`lib/db/src/schema/`)
- `allowedUsers` — list of authorized names + supervisor flags
- `userProfiles` — Clerk user profiles (web app users)
- `serviceReports` — overtime/service report submissions

### Seeded Users (supervisors)
- Daniel Castaneda, Tatiana Leal, Damian Ferrara (aka Marcos Damian Ferrara)

### Seeded Users (technicians)
- Pedro Gonzalez, Jonatan Baez, Fernando Barrera, Javier Espinola,
  Gustavo Mancuello Baez, Cristian Martinez, Gonzalo Perez, Guillermo Pipet,
  Nahuel Ueki, Juan Duarte

### Mobile App Screens
- `login.tsx` — name picker list, no password
- `(tabs)/index.tsx` — "Nuevo Parte" form (all overtime/service fields)
- `(tabs)/history.tsx` — report history list with summary stats
- `(tabs)/profile.tsx` — current user info + logout

### Form Fields (Nuevo Parte)
- Fecha (hoy / ayer / manual)
- Turno: Mañana / Tarde/Cierre / Noche
- Actividad (text)
- Horas Extra 50%: Normal, Normal >40km, Fin semana/Feriado, Fin semana/Feriado >40km
- Horas Extra 100%: same 4 variants
- Solo >40km (toggle + hours)
- Guardia asistencia técnica (stepper)
- Activación en campo (stepper)
- Adicional Guardia Semanal (toggle, max 4/month enforced server-side)
- Notas (optional text)
