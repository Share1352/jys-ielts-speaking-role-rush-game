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

- the speaker’s hidden role
- the speaker’s hidden chaos card

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
- Any public gameplay prompt ending in `?`

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

After teacher clicks reveal actual secret, viewer shows the speaker’s actual role and chaos card.

## 5. Game phases

Use these phases:

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
