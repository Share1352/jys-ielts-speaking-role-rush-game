# JYS IELTS Speaking Role Rush

Realtime IELTS speaking classroom game built as an npm workspaces monorepo.

## Repository architecture

```text
.
├─ client/            # React + Vite frontend (teacher, student, viewer UIs)
├─ server/            # Express + Socket.IO backend
├─ shared/            # Shared TypeScript types/constants consumed by client/server
├─ render.yaml        # Render deployment blueprint
├─ Dockerfile         # Container build for production
└─ package.json       # Root workspace scripts
```

- **Root workspace** orchestrates all packages with npm workspaces.
- **`shared`** is built first and used by both app layers.
- **`client`** builds static assets to `client/dist`.
- **`server`** serves API + Socket.IO and, in production mode, serves the built frontend from `client/dist`.

## Prerequisites

- **Node.js 22+** (Render config pins Node 22).
- **npm 10+** (comes with modern Node releases).

## Install

From the repository root:

```bash
npm install
```

This installs dependencies for all workspaces (`client`, `server`, `shared`).

## Development workflow

Run from repository root unless noted otherwise.

### 1) Start full local development

```bash
npm run dev
```

This runs three processes concurrently:

- `shared`: TypeScript watch build
- `server`: `tsx` watch for backend reloads
- `client`: Vite dev server

### 2) Type-check all workspaces

```bash
npm run typecheck
```

### 3) Build for production

```bash
npm run build
```

Build order:

1. `shared`
2. `client`
3. `server`

### 4) Start production server locally

```bash
npm run start
```

This launches the compiled backend (`server/dist/index.js`).

## Environment variables

### `PORT`

- Used by the backend HTTP server.
- Defaults to **`3000`** if not provided.
- In cloud platforms (Render/Railway/Fly), the platform-provided `PORT` is used automatically.

Example local override:

```bash
PORT=8080 npm run start
```

## Production behavior

After `npm run build`:

- Express serves static files from `client/dist`.
- `GET /api/health` returns backend health JSON.
- All non-API routes fall back to `client/dist/index.html` for SPA routing.
- Socket.IO runs on the same server/port as the HTTP app.

## Deployment notes

### Render (included)

`render.yaml` already defines:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Environment:** Node 22, `NODE_ENV=production`

Because the backend serves `client/dist`, only one web service is needed.

### Railway (optional)

Set:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`

No separate static hosting is required; the backend serves the frontend bundle.

### Fly.io (optional)

Use the same commands:

- **Build step:** `npm install && npm run build`
- **Run command:** `npm run start`

Ensure the app listens on `0.0.0.0:$PORT` via platform `PORT` injection (already supported by server code).

## Command reference (root)

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run start`
