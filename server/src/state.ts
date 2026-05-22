import type { RoomPhase, SpeakerBonusCategory } from '@jys/shared';
export { SPEAKER_BONUS_CATEGORIES } from '@jys/shared';
export type { RoomPhase, SpeakerBonusCategory } from '@jys/shared';

export type GuessResult = 'exact' | 'partial' | 'miss';

export interface PlayerState {
  id: string;
  displayName: string;
  seat: number;
  connected: boolean;
  waitingForNextRound: boolean;
  removed: boolean;
  score: number;
}

export interface PlayerRoundState {
  roleId: string | null;
  chaosCardId: string | null;
  rerolledRole: boolean;
  rerolledChaos: boolean;
  rerollRolePenalty: number;
  rerollChaosPenalty: number;
  hasSpoken: boolean;
}

export interface GuessSubmission {
  guesserPlayerId: string;
  targetSpeakerId: string;
  guessedRoleId: string;
  guessedChaosCardId: string;
  submittedAtEpochMs: number;
  updatedAtEpochMs: number;
  locked: boolean;
  roleResult?: GuessResult;
  chaosResult?: GuessResult;
  awardedPoints?: number;
}

export interface FollowUpState {
  requesterIds: string[];
  selectedRequesterId: string | null;
  awardedRequesterId: string | null;
  locked: boolean;
}

export interface TimerState {
  kind: 'prep' | 'speaker' | 'follow_up';
  durationSec: number;
  remainingSec: number;
  running: boolean;
  startedAtEpochMs: number | null;
}

export interface RoundState {
  roundNumber: number;
  phase: RoomPhase;
  topicPrompt: string;
  playerRound: Record<string, PlayerRoundState>;
  speakersRemaining: string[];
  currentSpeakerId: string | null;
  prepTimer: TimerState;
  speakerTimer: TimerState;
  followUpTimer: TimerState;
  guesses: Record<string, GuessSubmission>; // key: guesserId:targetId
  revealGuesses: boolean;
  revealSecret: boolean;
  followUp: FollowUpState;
  speakerBonuses: Record<string, Partial<Record<SpeakerBonusCategory, boolean>>>;
}

export interface RoomState {
  code: string;
  hostToken: string;
  phase: RoomPhase;
  locked: boolean;
  createdAtEpochMs: number;
  players: Record<string, PlayerState>;
  playerOrder: string[];
  activeRound: RoundState | null;
  roundHistory: RoundState[];
}
