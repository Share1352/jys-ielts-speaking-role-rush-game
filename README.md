# JYS IELTS Speaking Role Rush

A realtime online classroom game for IELTS Speaking practice.

Students join from their own devices. The teacher controls the game from a dashboard. A viewer screen is shared in the online meeting.

The game uses hidden roles, chaos cards, guessing, follow-up questions, and live scoring to make IELTS Speaking Part 3 style practice more fun.

## Repository status

This repository is intended to be built by Codex from the instructions in:

- `AGENTS.md`
- `SPEC.md`

Codex should build the full app inside this repository.

## App name

JYS IELTS Speaking Role Rush

## Main idea

A teacher creates a live game room.

Students join with their names and get seats.

The teacher starts a round.

The app shows a public IELTS-style topic, problem, or situation.

Each student privately receives:

- one hidden role
- one hidden chaos card

One student speaks at a time.

Other students guess:

- the speaker's role
- the speaker's chaos card

Students can also request to ask a follow-up question.

The teacher scores guesses, speaking performance, and good follow-up questions.

## Important gameplay rule

The app does not use IELTS questions.

It uses only topics, situations, problems, and scenarios.

## Planned stack

- React
- Vite
- TypeScript
- Node.js
- Express
- Socket.IO
- In-memory room state for v1

## Planned screens

### Teacher dashboard

The teacher controls the whole game.

### Student page

Students see only their own private role and chaos card.

### Viewer screen

The teacher screen-shares this page in the online meeting.

## Planned local development

After Codex builds the app, expected commands should be similar to:

```bash
npm install
npm run dev
```

Expected checks:

```bash
npm run typecheck
npm run build
```

## Deployment target

The app should be deployable to services such as:

- Render
- Railway
- Fly.io

The final server should serve the built frontend in production.

## Codex instruction

Use this prompt in Codex:

```text
Read AGENTS.md and SPEC.md. Build the full app in this existing repository. Do not create a new repository. Run all checks, fix errors, commit the finished project, and update README.md.
```
