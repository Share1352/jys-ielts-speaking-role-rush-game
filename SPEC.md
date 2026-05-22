# JYS IELTS Speaking Role Rush specification

## 1. Overview

Build a realtime classroom game app called:

JYS IELTS Speaking Role Rush

The app is for online IELTS Speaking practice with 4-5 Vietnamese students around B2-C1 level, usually 17 years old.

The app should make IELTS Speaking Part 3 style practice feel like a real game.

The teacher controls the game. Students join on their own devices. A separate viewer page is screen-shared in the online meeting.

The app has three main interfaces:

1. Teacher dashboard
2. Student private page
3. Viewer screen

The app uses live rooms. No login is needed.

The app must be simple, reliable, fast, and usable in a real class.

## 2. Core idea

Students are given hidden roles and chaos cards.

A public IELTS-style topic/problem/situation appears.

One student speaks at a time.

The speaker tries to:

- respond to the topic/problem/situation naturally
- fulfill their hidden role
- complete their chaos card
- sound like a strong IELTS speaker

The listeners try to guess:

- the speaker's hidden role
- the speaker's hidden chaos card

Listeners may also request to ask a follow-up question.

The teacher controls timing, reveal, scoring, and progression.

## 3. Critical rule: no IELTS questions

The app must not show IELTS questions.

Use only:

- topics
- problems
- situations
- scenarios
- dilemmas
- council-style decisions

The visible speaking prompt must not be phrased as a question.

Avoid question marks in public prompts.

Good examples:

- "A school wants to allow students to use AI tools for most homework. The council must decide how schools should manage this."
- "A city is trying to reduce traffic and pollution. The council must choose a fair solution for different groups of people."
- "Many teenagers want flexible careers instead of traditional stable jobs. The council must discuss what schools should do to prepare them."
- "Tourism is growing quickly in a small town. Local people are worried about prices, noise, and changes to culture."
- "An online platform has made some young influencers extremely rich. The council must discuss how this affects teenagers."

Bad examples:

- "Do you think AI is good for education?"
- "Should schools ban AI?"
- "What are the advantages of tourism?"
- Any public gameplay prompt ending in a question mark.

Internal code may use terms like `prompt`, `situation`, or `scenario`.

Do not use the word `question` for the main speaking task in the UI.

Use:

- "Topic"
- "Situation"
- "Speaking situation"
- "Round situation"
- "Problem"

## 4. Users and screens

### 4.1 Teacher dashboard

Route:

`/teacher/:roomCode?host=:hostToken`

The teacher dashboard is the control center.

The teacher can:

- create a room
- copy student join link
- open viewer screen
- see all joined students
- see seat numbers
- see connection status
- remove students
- rename students
- lock room
- unlock room
- start a new round
- randomize topic/situation
- privately assign roles and chaos cards
- see all student roles and chaos cards
- see who rerolled role
- see who rerolled chaos card
- start prep timer
- lock rerolls
- spin speaker wheel
- select speaker manually if needed
- start speaker timer
- pause speaker timer
- stop speaker timer
- reset speaker timer
- see guesses while hidden from viewer
- reveal guesses to viewer
- score guesses
- award speaker bonus points
- see follow-up question requests
- spin follow-up wheel if multiple listeners request follow-up
- award +1 for a good follow-up question
- reveal actual role and chaos card after scoring
- move to next speaker
- end round
- reset game
- export results as CSV and JSON

The teacher can see all hidden information.

### 4.2 Student private page

Route:

`/join/:roomCode`

Student flow:

1. Student opens join link.
2. Student enters name.
3. App assigns automatic seat number.
4. Student waits in lobby.
5. When round starts, student privately sees:
   - their name
   - their seat
   - their score
   - current topic
   - current situation
   - their own hidden role
   - their own hidden chaos card
   - whether they can reroll role
   - whether they can reroll chaos card
6. During prep phase, student can:
   - reroll role once for -1 point
   - reroll chaos card once for -1 point
7. During speaking phase:
   - if the student is the current speaker, show a clear "You are speaking now" view
   - if the student is a listener, show guess inputs and follow-up request button
8. During the speaker timer, listener can submit and edit guesses.
9. When the speaker timer stops, listener guess inputs lock.
10. Student stays connected after refresh using localStorage player ID.

Student page must be mobile-friendly.

### 4.3 Viewer screen

Route:

`/viewer/:roomCode`

The teacher opens this page in a separate browser tab and screen-shares it.

Viewer screen shows:

- app name
- room code
- round number
- current topic
- current situation
- seats and student names
- current phase
- current speaker
- speaker wheel or slot animation
- speaker timer
- prep timer
- scoreboard
- guess submission progress
- follow-up request list
- follow-up wheel when used
- revealed guesses after teacher reveal
- actual role and chaos card only after teacher reveal

Viewer screen must not show hidden roles or chaos cards early.

During speaking, viewer should show:

- current speaker
- timer
- "Guessing is open while the timer is running"
- number of submitted guesses
- follow-up question request indicators

Before reveal, viewer must not show actual guesses.

After teacher clicks reveal guesses, viewer shows submitted guesses.

After teacher clicks reveal actual secret, viewer shows the speaker's actual role and chaos card.

## 5. Game phases

Use these phases:

```ts
type RoomPhase =
  | "lobby"
  | "round_setup"
  | "prep"
  | "ready_to_speak"
  | "speaker_selection"
  | "speaking"
  | "speaker_finished"
  | "guesses_revealed"
  | "scoring"
  | "secret_revealed"
  | "round_complete";
```

### 5.1 Lobby

Students join. Seats appear.

Teacher can lock or unlock room.

### 5.2 Round setup

Teacher starts new round.

Server randomly chooses one topic/situation.

Server assigns each active student:

- one hidden role
- one hidden chaos card

Roles should be unique within a round if possible.

Chaos cards should be unique within a round if possible.

### 5.3 Prep

Students privately prepare.

Default prep timer: 90 seconds.

During prep:

- student may reroll role once
- student may reroll chaos card once

Reroll penalty:

- role reroll: -1 point
- chaos reroll: -1 point

Teacher can lock prep early.

### 5.4 Ready to speak

Rerolls are locked.

Teacher can spin speaker wheel.

### 5.5 Speaker selection

The wheel includes only students who have not spoken in the current round.

Teacher clicks spin.

Server chooses speaker.

Viewer shows animation.

### 5.6 Speaking

Teacher starts speaker timer.

Default speaker timer: 90 seconds.

During speaker timer:

- speaker speaks verbally in the online meeting
- listeners submit guesses
- listeners may edit and resubmit guesses
- listeners may press "I want to ask a follow-up question"

Important:

When the speaker timer stops, guessing closes immediately.

After timer stops:

- no new guesses
- no guess edits
- follow-up requests stop, unless already submitted

### 5.7 Speaker finished

Teacher can:

- see locked guesses
- see follow-up requesters
- spin follow-up wheel if needed
- allow selected student to ask follow-up verbally
- award +1 if follow-up question makes sense
- reveal guesses

### 5.8 Guesses revealed

Viewer shows all submitted guesses.

Teacher scores guesses.

### 5.9 Scoring

Teacher scores each guess.

Role guess:

- exact: +2
- partial: +1
- miss: +0

Chaos guess:

- exact: +2
- partial: +1
- miss: +0

Teacher awards speaker bonus points using only the five categories:

- used an idiom: +1
- used an advanced sentence structure: +1
- completed the chaos card: +1
- fulfilled the role: +1
- had almost no grammar or pronunciation mistakes: +1

Teacher may award +1 to a selected follow-up question asker if the question made sense.

### 5.10 Secret revealed

Teacher reveals actual role and chaos card.

Viewer shows actual secret.

### 5.11 Round complete

Round ends after every active student has spoken once.

Teacher can start another round or reset game.

## 6. Scoring

### 6.1 Guess scoring

For each listener guessing the current speaker:

Role:

- exact match: +2
- partial match: +1
- miss: +0

Chaos card:

- exact match: +2
- partial match: +1
- miss: +0

Maximum guessing score per speaker turn: +4.

### 6.2 Speaker bonus scoring

Teacher can award the speaker:

- used an idiom: +1
- used an advanced sentence structure: +1
- completed the chaos card: +1
- fulfilled the role: +1
- had almost no grammar or pronunciation mistakes: +1

Maximum speaker bonus per turn: +5.

No other speaker bonus categories are allowed.

### 6.3 Follow-up question scoring

Listeners can request to ask a follow-up question while the speaker is speaking.

After speaker finishes:

- If one student requested, teacher can select that student.
- If several students requested, teacher can spin a follow-up wheel.
- If the selected student's follow-up question makes sense, teacher can award +1.

Maximum follow-up score per speaker turn: +1 for the selected asker.

The speaker does not get this point.

### 6.4 Reroll penalties

During prep phase:

- reroll role: -1
- reroll chaos card: -1

Each is separate.

A student can use both, meaning total penalty can be -2.

## 7. Timers

Implement:

- prep timer: default 90 seconds
- speaker timer: default 90 seconds
- optional follow-up timer: default 30 seconds

Teacher can:

- start
- pause
- stop
- reset

Important:

The speaker timer controls guess availability.

When speaker timer is running:

- listeners can submit guesses
- listeners can edit guesses
- listeners can request follow-up

When speaker timer is stopped:

- guess submissions lock
- guess edits lock
- follow-up requests lock

## 8. Room creation and joining

### 8.1 Create room

Teacher opens home page and clicks create room.

Server creates:

- room code, for example `JYS482`
- host token
- room state

Teacher is redirected to:

`/teacher/JYS482?host=HOST_TOKEN`

The page shows:

- student join link
- viewer link

### 8.2 Student join

Student opens:

`/join/JYS482`

Student enters display name.

Rules:

- trim spaces
- limit name to 30 characters
- escape/sanitize all user input
- duplicate names allowed
- show seat numbers clearly

Student receives:

- player ID
- seat number

Store in localStorage:

- roomCode
- playerId

### 8.3 Reconnect

If student refreshes, reconnect using localStorage playerId.

Keep:

- seat number
- score
- role/card for current round
- reroll status
- submitted guesses if still relevant

### 8.4 Disconnect

If student disconnects:

- do not delete immediately
- mark as disconnected
- viewer shows disconnected status
- teacher can remove manually

### 8.5 Late join

If a student joins after a round has started:

- allow them into room
- mark as "waiting for next round"
- do not assign current round role/card
- do not include them in current speaker wheel

## 9. Privacy and state payloads

This is critical.

Implement three state payload builders:

1. `buildTeacherPayload(room, hostToken)`
2. `buildStudentPayload(room, playerId)`
3. `buildViewerPayload(room)`

### 9.1 Teacher payload

Includes:

- full room state
- all players
- scores
- connection status
- all hidden roles
- all hidden chaos cards
- reroll status
- all guesses
- all follow-up requests
- scoring data

### 9.2 Student payload

Includes:

- public room state
- student list with names, seats, scores
- current topic
- current situation
- current speaker
- timer state
- own score
- own role and chaos card only
- own reroll availability
- own guess status
- whether guessing is open
- whether follow-up request is open

Does not include other students' hidden roles or chaos cards.

### 9.3 Viewer payload

Includes:

- room code
- phase
- students
- seats
- scores
- current topic
- current situation
- current speaker
- timers
- submitted guess count
- follow-up requesters by name
- revealed guesses only after reveal
- actual role/chaos only after teacher reveals secret

Does not include hidden roles/cards early.

## 10. Suggested TypeScript types

Use clean TypeScript types similar to these.

```ts
export type RoomPhase =
  | "lobby"
  | "round_setup"
  | "prep"
  | "ready_to_speak"
  | "speaker_selection"
  | "speaking"
  | "speaker_finished"
  | "guesses_revealed"
  | "scoring"
  | "secret_revealed"
  | "round_complete";

export type Player = {
  id: string;
  name: string;
  seatNumber: number;
  score: number;
  connected: boolean;
  joinedAt: number;
  activeInCurrentRound: boolean;
  hasSpokenThisRound: boolean;
  roleRerolledThisRound: boolean;
  chaosRerolledThisRound: boolean;
};

export type TopicSituation = {
  id: string;
  title: string;
  situation: string;
  speakingGoal: string;
  roles: RoleCard[];
};

export type RoleCard = {
  id: string;
  title: string;
  description: string;
  personality: string;
  priorities: string[];
  whatToRevealIndirectly: string[];
  speakingHints: string[];
};

export type ChaosCard = {
  id: string;
  title: string;
  instruction: string;
  successCriteria: string[];
  examplePhrases: string[];
};

export type AssignedSecret = {
  playerId: string;
  role: RoleCard;
  chaos: ChaosCard;
};

export type Guess = {
  id: string;
  roundId: string;
  speakerId: string;
  guesserId: string;
  roleGuess: string;
  chaosGuess: string;
  submittedAt: number;
  updatedAt: number;
  locked: boolean;
  roleScore?: 0 | 1 | 2;
  chaosScore?: 0 | 1 | 2;
};

export type FollowUpRequest = {
  id: string;
  roundId: string;
  speakerId: string;
  requesterId: string;
  requestedAt: number;
  selected: boolean;
  awardedPoint: boolean;
};

export type SpeakerBonus = {
  usedIdiom: boolean;
  usedAdvancedSentenceStructure: boolean;
  completedChaosCard: boolean;
  fulfilledRole: boolean;
  almostNoGrammarOrPronunciationMistakes: boolean;
};

export type TimerState = {
  type: "prep" | "speaker" | "follow_up" | null;
  durationSeconds: number;
  remainingSeconds: number;
  running: boolean;
  startedAt?: number;
};

export type Round = {
  id: string;
  roundNumber: number;
  topic: TopicSituation;
  assignedSecrets: AssignedSecret[];
  spokenPlayerIds: string[];
  currentSpeakerId?: string;
  guesses: Guess[];
  followUpRequests: FollowUpRequest[];
  selectedFollowUpRequesterId?: string;
  speakerBonuses: Record<string, SpeakerBonus>;
  revealedGuessesForSpeakerId?: string;
  revealedSecretForSpeakerId?: string;
  startedAt: number;
};

export type RoomState = {
  code: string;
  hostToken: string;
  phase: RoomPhase;
  locked: boolean;
  players: Player[];
  currentRound?: Round;
  timer: TimerState;
  createdAt: number;
  updatedAt: number;
};
```

## 11. Socket events

Use Socket.IO.

### 11.1 Room events

- `room:create`
- `room:join`
- `room:reconnect`
- `room:state`
- `room:error`

### 11.2 Teacher events

- `teacher:lockRoom`
- `teacher:unlockRoom`
- `teacher:removePlayer`
- `teacher:renamePlayer`
- `teacher:startRound`
- `teacher:startPrep`
- `teacher:lockPrep`
- `teacher:spinSpeaker`
- `teacher:selectSpeaker`
- `teacher:startSpeakerTimer`
- `teacher:pauseTimer`
- `teacher:stopTimer`
- `teacher:resetTimer`
- `teacher:revealGuesses`
- `teacher:scoreGuess`
- `teacher:setSpeakerBonus`
- `teacher:spinFollowUpWheel`
- `teacher:selectFollowUpRequester`
- `teacher:awardFollowUpPoint`
- `teacher:revealSecret`
- `teacher:nextSpeaker`
- `teacher:endRound`
- `teacher:resetGame`
- `teacher:exportResults`

### 11.3 Student events

- `student:join`
- `student:reconnect`
- `student:rerollRole`
- `student:rerollChaos`
- `student:submitGuess`
- `student:requestFollowUp`
- `student:cancelFollowUpRequest`

### 11.4 Viewer events

Viewer does not need to send game-changing events.

Viewer receives public state.

## 12. Content bank

Create static content files:

- `server/src/data/topicSituations.ts`
- `server/src/data/chaosCards.ts`

No AI generation in v1.

Use vetted static content.

### 12.1 Required topics

Include at least these 12 topics:

1. Education and technology
2. Exams and pressure
3. Jobs and success
4. Social media and influencers
5. Environment and transport
6. Money and lifestyle
7. Cities and countryside
8. Family and generations
9. Health and habits
10. Culture and traditions
11. Travel and tourism
12. Government and society

Each topic must include:

- id
- title
- situation
- speakingGoal
- at least 8 detailed roles

### 12.2 Role quality requirements

Each role must be more detailed than a few words.

Each role should include:

- clear title
- detailed description, 2-4 sentences
- personality or speaking style
- priorities
- what the student should reveal indirectly
- speaking hints

Roles should be interesting and playable.

Good role example:

```ts
{
  id: "worried_parent",
  title: "Worried parent",
  description:
    "You are a parent who wants children to use technology carefully. You are not completely against AI or online learning, but you believe students still need human teachers, discipline, and emotional support. You worry that teenagers may become too dependent on shortcuts if schools allow technology without clear limits.",
  personality:
    "Careful, protective, realistic, and slightly skeptical of extreme solutions.",
  priorities: [
    "Protect students' mental health and attention span",
    "Keep human connection in education",
    "Allow technology only with clear rules"
  ],
  whatToRevealIndirectly: [
    "You care about children, not just exam results",
    "You worry about habits at home",
    "You prefer balance over banning everything"
  ],
  speakingHints: [
    "Mention emotional development or discipline",
    "Give a family or school example",
    "Accept one benefit of technology before explaining the risk"
  ]
}
```

Bad role example:

```ts
{
  title: "Parent",
  description: "You worry about children."
}
```

Do not make roles that encourage unsafe or inappropriate behavior.

### 12.3 Chaos card requirements

Include at least 30 chaos cards.

Each chaos card should include:

- id
- title
- instruction
- success criteria
- example phrases

Chaos cards should push IELTS Part 3 style skills without being IELTS questions.

Good chaos examples:

- Use an idiom naturally
- Use a conditional sentence
- Compare two generations
- Mention a long-term consequence
- Mention an exception
- Give a specific Vietnam example
- Explain both sides before your opinion
- Use a concession with "Although..."
- Use a cause-effect chain
- Mention what the government should do
- Mention what schools should do
- Mention rich and poor families
- Give a personal observation without sounding memorized
- Use a contrast between short-term and long-term effects
- Use a prediction about the future
- Use a passive structure
- Use a relative clause
- Use a noun phrase instead of a simple verb phrase
- Use a balanced phrase such as "It depends on..."
- Avoid the words "good", "bad", and "important"
- Start with a surprising opinion
- Admit one weakness in your own argument
- Use a real-life example
- Mention unintended consequences
- Compare city life and countryside life
- Explain how this affects teenagers specifically
- Explain how this affects older people specifically
- Use a formal linking phrase naturally
- Include a practical solution
- End with a strong conclusion

## 13. UI design

### 13.1 General style

Use a clean, game-like classroom style.

Suggested visual direction:

- dark navy or deep purple background
- bright cards
- large readable text
- large buttons
- clear score table
- simple animations
- no clutter
- mobile-friendly student page
- desktop-friendly teacher dashboard
- big screen-friendly viewer page

### 13.2 Teacher dashboard layout

Suggested sections:

1. Room controls
2. Student seats
3. Current round
4. Hidden role and chaos table
5. Timer controls
6. Speaker controls
7. Guess controls
8. Follow-up controls
9. Scoring panel
10. Export/reset controls

### 13.3 Student page layout

Suggested sections:

1. Header with name, seat, score
2. Current topic and situation
3. Private role card
4. Private chaos card
5. Reroll buttons during prep
6. Current speaker status
7. Guess inputs during speaker timer if listener
8. Follow-up request button if listener
9. Locked/submitted status

### 13.4 Viewer layout

Suggested sections:

1. App title and room code
2. Current phase
3. Current topic and situation
4. Current speaker
5. Large timer
6. Scoreboard
7. Seats
8. Guess progress
9. Follow-up request display
10. Revealed guesses
11. Revealed actual role/chaos

The viewer must be readable on screen share.

## 14. Button labels

Use clear labels.

Teacher buttons:

- Create room
- Copy student link
- Open viewer screen
- Lock room
- Unlock room
- Start new round
- Start prep timer
- Lock prep
- Spin speaker wheel
- Select speaker manually
- Start speaker timer
- Pause timer
- Stop timer and lock guesses
- Reset timer
- Reveal guesses
- Reveal actual role and chaos
- Next speaker
- End round
- Reset game
- Export results

Student buttons:

- Join game
- Reroll role (-1 point)
- Reroll chaos card (-1 point)
- Submit guess
- Update guess
- I want to ask a follow-up question
- Cancel follow-up request

Viewer labels:

- Current topic
- Situation
- Current speaker
- Timer
- Scoreboard
- Seats
- Guess status
- Follow-up requests
- Revealed guesses
- Actual role
- Actual chaos card

## 15. Speaker wheel

Build a simple animated wheel or slot-machine animation.

Requirements:

- shows names of eligible students
- excludes students who already spoke this round
- teacher triggers it
- server chooses result
- viewer shows animation
- teacher dashboard shows result
- selected student becomes current speaker

A slot-machine animation is acceptable for v1.

Example visual sequence:

`Minh -> Linh -> Bao -> Anh -> Linh`

Then it stops on selected speaker.

## 16. Follow-up wheel

If more than one listener requests a follow-up question, teacher can spin a follow-up wheel.

Requirements:

- includes only students who requested follow-up for the current speaker
- excludes current speaker
- server chooses result
- viewer shows animation
- selected student gets chance to ask verbally
- teacher can award +1 if the question makes sense

If only one student requested, teacher can select them without wheel.

## 17. Guessing behavior

During the speaker timer, listeners see:

- role guess input
- chaos card guess input
- submit/update button

Rules:

- A listener can submit once, then edit and update while the timer is still running.
- The latest submission is the active guess.
- When the speaker timer stops, lock the guess.
- If a student never submitted before timer stopped, they have no guess for that speaker.
- Speaker cannot submit guess for themselves.
- Teacher can see guesses after they are submitted.
- Viewer only sees count before reveal.

Viewer before reveal:

`Guesses submitted: 3/4`

Viewer after reveal:

- student name
- role guess
- chaos guess

## 18. Security and validation

This is a classroom app, not a banking app, but basic protections matter.

Implement:

- host token for teacher dashboard
- sanitized user names
- sanitized guess text
- length limits
- no HTML injection
- room code validation
- event authorization
- teacher events require valid host token
- student events require valid player ID
- viewer receives public state only

Suggested limits:

- student name: 30 characters
- role guess: 120 characters
- chaos guess: 120 characters
- room code: uppercase alphanumeric

## 19. Edge cases

Handle these.

### 19.1 Student refreshes

Reconnect by localStorage playerId.

### 19.2 Teacher refreshes

Reconnect using host token in URL.

### 19.3 Viewer refreshes

Reconnect as viewer.

### 19.4 Student disconnects

Mark disconnected. Do not delete automatically.

### 19.5 Student rejoins with same localStorage

Restore same player.

### 19.6 Duplicate names

Allow duplicate names but show seat numbers.

### 19.7 Late join

Student waits for next round.

### 19.8 Not enough students

Allow game with 2+ students, but design for 4-5.

### 19.9 Room cleanup

Delete inactive rooms after 6 hours.

### 19.10 No eligible speaker

If all active students have spoken, round is complete.

## 20. Export results

Teacher can export results.

CSV should include:

- room code
- round number
- player name
- seat number
- final score
- role rerolls
- chaos rerolls
- speaker bonuses
- follow-up points
- guess points

JSON should include full teacher-safe game summary.

## 21. Local development

Use a root package manager setup that makes this easy.

Recommended scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace server\" \"npm run dev --workspace client\"",
    "build": "npm run build --workspace server && npm run build --workspace client",
    "typecheck": "npm run typecheck --workspace server && npm run typecheck --workspace client",
    "start": "npm run start --workspace server"
  }
}
```

Use whatever workspace setup is cleanest.

## 22. Suggested repo structure

```text
jys-ielts-speaking-role-rush-game/
  AGENTS.md
  SPEC.md
  README.md
  package.json
  .gitignore
  Dockerfile
  render.yaml
  server/
    package.json
    tsconfig.json
    src/
      index.ts
      socket.ts
      rooms.ts
      state.ts
      timers.ts
      scoring.ts
      sanitize.ts
      payloads.ts
      export.ts
      data/
        topicSituations.ts
        chaosCards.ts
      types.ts
  client/
    package.json
    index.html
    vite.config.ts
    tsconfig.json
    src/
      main.tsx
      App.tsx
      socket.ts
      types.ts
      routes/
        Home.tsx
        TeacherPage.tsx
        StudentPage.tsx
        ViewerPage.tsx
      components/
        Scoreboard.tsx
        SeatMap.tsx
        TimerDisplay.tsx
        SpeakerWheel.tsx
        FollowUpWheel.tsx
        RoleCard.tsx
        ChaosCard.tsx
        GuessPanel.tsx
        TeacherControls.tsx
        HiddenAssignmentsTable.tsx
      styles/
        globals.css
```

## 23. Acceptance checklist

The app is complete when all of this works:

1. Teacher creates room.
2. Teacher gets student join link and viewer link.
3. Students join with names.
4. Seats appear on viewer screen.
5. Teacher starts new round.
6. Public topic and situation appear.
7. No IELTS questions appear.
8. Each active student privately receives a detailed role and chaos card.
9. Teacher sees all roles and chaos cards.
10. Viewer does not see hidden roles/cards.
11. Student can reroll role once during prep for -1.
12. Student can reroll chaos card once during prep for -1.
13. Reroll penalties update scoreboard.
14. Teacher locks prep.
15. Teacher spins speaker wheel.
16. Current speaker appears on viewer.
17. Teacher starts speaker timer.
18. While timer runs, listeners submit guesses.
19. Listeners can edit and resubmit guesses while timer runs.
20. Speaker cannot guess themselves.
21. Listeners can request follow-up questions while timer runs.
22. Viewer shows follow-up requesters.
23. Timer stop locks guesses and follow-up requests.
24. Teacher can reveal guesses.
25. Viewer shows revealed guesses only after reveal.
26. Teacher scores exact/partial/miss for role and chaos.
27. Teacher awards speaker bonus using only the five allowed categories.
28. Teacher can spin follow-up wheel if several students requested.
29. Teacher can award +1 for a good follow-up question.
30. Teacher reveals actual role and chaos card.
31. Viewer shows actual role and chaos only after reveal.
32. Scores update live.
33. Teacher moves to next speaker.
34. Round completes after all students speak.
35. Student refresh reconnect works.
36. Teacher refresh reconnect works.
37. Viewer refresh reconnect works.
38. Build passes.
39. Typecheck passes.
40. README explains how to run and deploy.

## 24. Deployment

Prepare for deployment to Render, Railway, or Fly.io.

The server should serve the built frontend in production.

Use environment variable:

`PORT`

Default local port:

`3000`

Frontend dev server can use Vite default.

Include deployment notes in README.

## 25. Implementation priority

Build in this order:

1. Project scaffold
2. Server room state
3. Socket events
4. Payload privacy separation
5. Student join and reconnect
6. Viewer screen
7. Teacher dashboard
8. Round start and assignment
9. Rerolls
10. Speaker wheel
11. Timer-controlled guessing
12. Follow-up requests and wheel
13. Scoring
14. Reveal flows
15. Export
16. Styling
17. README
18. Typecheck/build fixes
