# JYS IELTS Speaking Role Rush

Workspace-based full-stack TypeScript app scaffold.

## Stack

- React + Vite + TypeScript (`client/`)
- Node.js + Express + Socket.IO + TypeScript (`server/`)
- Shared types workspace package (`shared/`)

## Scripts

From repository root:

- `npm run dev` - runs shared compiler watch, server dev runtime, and Vite dev server
- `npm run typecheck` - type-checks all workspaces
- `npm run build` - builds shared package, client assets, and server output
- `npm run start` - starts compiled server (serves built frontend from `client/dist`)

## Local setup

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Production run after build:

```bash
npm run start
```

## Deploy (Render)

`render.yaml` is configured so Render will:

1. Run `npm install && npm run build`
2. Start with `npm run start`

The Express server serves static frontend assets from `client/dist`.
