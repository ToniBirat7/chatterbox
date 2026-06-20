# Palm Mind Task(Chat App Not Completed Features left) — Working Pipeline

> Outside the markers below is human-owned. The pulse skill only rewrites content
> between the sentinels, leaving your notes intact.

## Dev / build / deploy flow

_How you run, build, test, and ship this project._

<!-- pulse:auto:start -->
- **Dev backend**: `cd backend && npm install && npm run dev` — tsx watch on `src/server.ts`, listens on port 3000
- **Dev frontend**: `cd frontend && npm install && npm run dev` — Vite dev server on port 5173; CSS: `npm run tailwind:watch`
- **Lint**: `cd frontend && npm run lint` (ESLint with typescript-eslint)
- **Build backend**: `cd backend && npm run build` → `dist/` (tsc)
- **Build frontend**: `cd frontend && npm run build` → `dist/` (tsc + vite build)
- **DB migrations (dev)**: `cd backend && npm run db:migrate:dev` (prisma migrate dev)
- **DB migrations (prod)**: runs automatically inside container via `entrypoint.sh` → `prisma migrate deploy`
- **Docker prod deploy**: `docker compose up -d --build` at repo root — builds backend (Node 22-alpine) and frontend (Node 22-alpine → nginx:alpine), starts palm-postgres, runs migrations, exposes backend on 127.0.0.1:3003 and frontend on 127.0.0.1:3002
- **Prisma studio**: `cd backend && npm run db:studio`
<!-- pulse:auto:end -->
