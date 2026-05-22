export type RoomPhase = 'lobby' | 'prep' | 'speaker' | 'guess-review' | 'round-complete';

export type SpeakerBonusCategory =
  | 'used_idiom'
  | 'used_advanced_sentence_structure'
  | 'completed_chaos_card'
  | 'fulfilled_role'
  | 'almost_no_grammar_or_pronunciation_mistakes';

export interface RoundTimerState {
  prepSecondsRemaining: number;
  speakerSecondsRemaining: number;
  isRunning: boolean;
  startedAtEpochMs?: number;
}

export interface GuessSubmission {
  guesserPlayerId: string;
  targetSpeakerId: string;
  guessedRoleId: string;
  guessedChaosCardId: string;
  submittedAtEpochMs: number;
  locked: boolean;
}

export interface FollowUpRequest {
  playerId: string;
  forSpeakerPlayerId: string;
  requestedAtEpochMs: number;
}

export interface PlayerRoundPrivateState {
  roleId: string;
  chaosCardId: string;
  rerolledRole: boolean;
  rerolledChaosCard: boolean;
}

export interface PlayerPublicState {
  id: string;
  displayName: string;
  score: number;
  connected: boolean;
  isCurrentSpeaker: boolean;
}

export interface RoundState {
  roundNumber: number;
  phase: RoomPhase;
  topicPrompt: string;
  speakerOrder: string[];
  currentSpeakerIndex: number;
  timer: RoundTimerState;
  followUpRequests: FollowUpRequest[];
  guesses: GuessSubmission[];
}

export interface PublicRoomState {
  roomCode: string;
  players: PlayerPublicState[];
  round: RoundState | null;
}

export interface TeacherPayload {
  role: 'teacher';
  publicState: PublicRoomState;
  playerPrivateStateById: Record<string, PlayerRoundPrivateState>;
}

export interface StudentPayload {
  role: 'student';
  selfPlayerId: string;
  publicState: PublicRoomState;
  selfPrivateState: PlayerRoundPrivateState | null;
}

export interface ViewerPayload {
  role: 'viewer';
  publicState: PublicRoomState;
}

export type RoomPayload = TeacherPayload | StudentPayload | ViewerPayload;
