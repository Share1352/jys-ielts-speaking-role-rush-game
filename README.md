# JYS IELTS Speaking Role Rush

Realtime IELTS speaking classroom game built as an npm workspaces monorepo.

## Game modes

- **Group mode (2+ students):** the usual game. One student speaks while the
  other students (listeners) secretly guess the speaker's hidden role and chaos
  card. The teacher scores the listeners' guesses.
- **1-on-1 mode (exactly 1 student):** activated automatically when only one
  student is in the room — ideal for private online lessons. The student speaks
  and the **teacher** guesses the student's hidden role and chaos card. The
  student's cards stay hidden from the teacher's dashboard until the teacher
  reveals the secret, so guessing stays fair. The speaker/follow-up wheels are
  hidden, and the teacher's guess is scored for feedback only (it does not
  change the student's score, which still comes from speaker bonuses minus any
  reroll penalties).

All game content (topics, roles and chaos cards) lives in `shared/src/index.ts`
as a single source of truth, written in simple, natural English aimed at
teenage learners. Public speaking prompts are always phrased as situations,
never as questions (no question marks, no "should"/"do you think").

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

### Wix hosting page setup (English Academy main site)

Use this app as an external hosted web app, then link/embed it from your Wix page at `www.jysenglish.com`:

1. Deploy this repository to Render (or any Node host) so you get a public URL, e.g. `https://jys-role-rush.onrender.com`.
2. In Wix Editor for **English Academy** site:
   - Add a new page (example name: **IELTS Role Rush Host**).
   - Add short host instructions and three CTA buttons:
     - **Open Host Setup Page** → deployed app root `/`
     - **Student Join Link Format** → `/join/:roomCode`
     - **Viewer Link Format** → `/viewer/:roomCode`
3. Optional: add an **Embed -> Embed a Site** element and set it to your deployed app root URL.
4. Publish Wix site and test the full flow end-to-end with a teacher and at least one student device.

Recommended page copy for teachers:

- Open Host Setup Page.
- Generate room code and host token.
- Open teacher link privately.
- Share student link to learners.
- Open viewer link on shared screen.


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
