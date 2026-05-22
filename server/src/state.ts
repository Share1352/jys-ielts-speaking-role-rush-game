export type RoomPhase =
  | 'lobby'
  | 'round_setup'
  | 'prep'
  | 'ready_to_speak'
  | 'speaker_selection'
  | 'speaking'
  | 'speaker_finished'
  | 'guesses_revealed'
  | 'scoring'
  | 'secret_revealed'
  | 'round_complete';

export type GuessResult = 'exact' | 'partial' | 'miss';

export const SPEAKER_BONUS_CATEGORIES = [
  'used_idiom',
  'used_advanced_sentence_structure',
  'completed_chaos_card',
  'fulfilled_role',
  'almost_no_grammar_or_pronunciation_mistakes'
] as const;

export type SpeakerBonusCategory = (typeof SPEAKER_BONUS_CATEGORIES)[number];

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
