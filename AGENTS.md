# AGENTS.md

You are working inside this existing GitHub repository:

https://github.com/Share1352/jys-ielts-speaking-role-rush-game

Do not create a new repository.

Build the full app from scratch according to `SPEC.md`.

## Product name

JYS IELTS Speaking Role Rush

## Main task

Create a realtime IELTS Speaking classroom game app with:

- Teacher dashboard
- Student private page
- Viewer screen for screen sharing
- Realtime sync
- Private hidden roles and chaos cards
- Topic/problem/situation prompts only
- No IELTS questions anywhere in the gameplay

## Required stack

Use:

- React
- Vite
- TypeScript
- Node.js
- Express
- Socket.IO
- In-memory room state for v1
- No external database for v1

## Repository rules

Work only in this repository.

Create a clean full-stack project structure.

Include:

- frontend app
- backend server
- shared TypeScript types where useful
- static game content
- Dockerfile
- render.yaml
- README.md
- .gitignore
- package scripts for install, dev, build, typecheck, and start

## Important gameplay rules

The app must not use IELTS questions.

The public speaking prompt should be a topic, problem, scenario, or situation.

Examples of acceptable prompts:

- "A school wants to allow students to use AI tools for most homework. The council must decide how schools should manage this."
- "A city is trying to reduce traffic and pollution. The council must choose a fair solution for different groups of people."
- "Many teenagers want flexible careers instead of traditional stable jobs. The council must discuss what schools should do to prepare them."

Examples of unacceptable prompts:

- "Do you think technology will replace teachers?"
- "Should schools ban AI?"
- Any visible prompt ending in a question mark

## Speaker bonus categories

The teacher can award speaker bonus points only for these five categories:

1. Used an idiom
2. Used an advanced sentence structure
3. Completed the chaos card
4. Fulfilled the role
5. Had almost no grammar or pronunciation mistakes

Each category is worth +1 point.

Do not add other speaker bonus categories.

## Reroll rules

Each student may reroll their role and chaos card separately.

- Reroll role: -1 point
- Reroll chaos card: -1 point
- Each can be used once per round
- Rerolls are allowed only during prep phase
- Teacher can see who rerolled what

## Guess rules

Listeners guess the current speaker’s hidden role and chaos card.

Guess inputs are open only while the speaker timer is running.

Students may submit, edit, and resubmit guesses while the speaker timer is running.

As soon as the speaker timer stops:

- no new guesses
- no guess edits
- guess inputs lock

The current speaker cannot guess themselves.

## Follow-up question rules

While listening, students can press a button to indicate that they want to ask the current speaker a follow-up question after the speaker finishes.

This request should be visible to:

- teacher dashboard
- viewer screen

If only one student requests a follow-up, the teacher may select that student.

If several students request a follow-up, the teacher can spin a wheel containing only those students.

The selected student asks the speaker a follow-up question verbally in the online meeting.

If the question makes sense, the teacher can award that student +1 point.

This +1 is only for the student who asks a good follow-up question.

## Privacy rules

There must be separate state payloads:

- Teacher payload: can see everything
- Student payload: can see public state plus only their own hidden role and chaos card
- Viewer payload: can see public state only

Do not leak hidden roles or hidden chaos cards to students or viewer before teacher reveal.

## Build quality

Before finishing:

1. Install dependencies.
2. Run typecheck.
3. Run build.
4. Fix all errors.
5. Test the basic flow manually if possible.
6. Update README.md with local run instructions and deployment notes.
7. Commit the finished project.

## Expected final result

The app should let a teacher run a full online speaking game with 4-5 students:

1. Teacher creates room.
2. Students join with names.
3. Seats appear on viewer screen.
4. Teacher starts a round.
5. A topic/problem/situation appears publicly.
6. Each student privately receives a detailed role and chaos card.
7. Students may reroll role and/or chaos card separately during prep.
8. Teacher starts speaker wheel.
9. Speaker timer starts.
10. Listeners guess role and chaos card while timer runs.
11. Listeners can request follow-up questions.
12. Timer stops and guesses lock.
13. Teacher reveals guesses.
14. Teacher scores guesses.
15. Teacher awards speaker bonuses using only the five allowed categories.
16. Teacher optionally awards +1 for a good follow-up question.
17. Scoreboard updates live.
18. Teacher moves to next speaker.
19. Round ends after all students speak.
