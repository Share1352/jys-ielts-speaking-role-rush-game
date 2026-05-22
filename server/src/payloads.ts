import type {
  FollowUpState,
  GuessSubmission,
  PlayerRoundState,
  RoomState,
  RoundState,
  SpeakerBonusCategory
} from './state.js';

export interface PublicGuessView {
  guesserPlayerId: string;
  targetSpeakerId: string;
  locked: boolean;
  submittedAtEpochMs: number;
  updatedAtEpochMs: number;
  guessedRoleId?: string;
  guessedChaosCardId?: string;
  roleResult?: GuessSubmission['roleResult'];
  chaosResult?: GuessSubmission['chaosResult'];
  awardedPoints?: number;
}

export interface PublicRoundView {
  roundNumber: number;
  phase: RoundState['phase'];
  topicPrompt: string;
  speakersRemaining: string[];
  currentSpeakerId: string | null;
  prepTimer: RoundState['prepTimer'];
  speakerTimer: RoundState['speakerTimer'];
  followUpTimer: RoundState['followUpTimer'];
  revealGuesses: boolean;
  revealSecret: boolean;
  followUp: FollowUpState;
  guesses: PublicGuessView[];
  guessCountsByTargetSpeakerId: Record<string, number>;
  speakerBonuses: Record<string, Partial<Record<SpeakerBonusCategory, boolean>>>;
  playerRoundPublic: Record<string, Pick<PlayerRoundState, 'rerolledRole' | 'rerolledChaos' | 'hasSpoken'>>;
  revealedSecretsByPlayerId: Record<string, { roleId: string | null; chaosCardId: string | null }>;
}

export interface PublicRoomPayload {
  code: string;
  phase: RoomState['phase'];
  locked: boolean;
  createdAtEpochMs: number;
  playerOrder: string[];
  players: RoomState['players'];
  activeRound: PublicRoundView | null;
}

export interface TeacherPayload {
  role: 'teacher';
  hostAuthorized: boolean;
  publicState: PublicRoomPayload;
  internals: {
    guesses: Record<string, GuessSubmission>;
    followUp: FollowUpState | null;
    speakerBonuses: Record<string, Partial<Record<SpeakerBonusCategory, boolean>>> | null;
  };
  playerPrivateStateById: Record<string, Pick<PlayerRoundState, 'roleId' | 'chaosCardId' | 'rerolledRole' | 'rerolledChaos' | 'rerollRolePenalty' | 'rerollChaosPenalty' | 'hasSpoken'>>;
}

export interface StudentPayload {
  role: 'student';
  selfPlayerId: string;
  publicState: PublicRoomPayload;
  selfPrivateState: Pick<PlayerRoundState, 'roleId' | 'chaosCardId' | 'rerolledRole' | 'rerolledChaos' | 'rerollRolePenalty' | 'rerollChaosPenalty' | 'hasSpoken'> | null;
}

export interface ViewerPayload {
  role: 'viewer';
  publicState: PublicRoomPayload;
}

function buildPublicRoundView(room: RoomState): PublicRoundView | null {
  const round = room.activeRound;
  if (!round) return null;

  const guesses = Object.values(round.guesses);
  const guessCountsByTargetSpeakerId = guesses.reduce<Record<string, number>>((acc, guess) => {
    acc[guess.targetSpeakerId] = (acc[guess.targetSpeakerId] ?? 0) + 1;
    return acc;
  }, {});

  const guessesForPublic: PublicGuessView[] = guesses.map((guess) => {
    if (round.revealGuesses) {
      return {
        guesserPlayerId: guess.guesserPlayerId,
        targetSpeakerId: guess.targetSpeakerId,
        guessedRoleId: guess.guessedRoleId,
        guessedChaosCardId: guess.guessedChaosCardId,
        roleResult: guess.roleResult,
        chaosResult: guess.chaosResult,
        awardedPoints: guess.awardedPoints,
        submittedAtEpochMs: guess.submittedAtEpochMs,
        updatedAtEpochMs: guess.updatedAtEpochMs,
        locked: guess.locked
      };
    }

    return {
      guesserPlayerId: guess.guesserPlayerId,
      targetSpeakerId: guess.targetSpeakerId,
      submittedAtEpochMs: guess.submittedAtEpochMs,
      updatedAtEpochMs: guess.updatedAtEpochMs,
      locked: guess.locked
    };
  });

  const playerRoundPublic = Object.fromEntries(
    Object.entries(round.playerRound).map(([playerId, playerRound]) => [
      playerId,
      {
        rerolledRole: playerRound.rerolledRole,
        rerolledChaos: playerRound.rerolledChaos,
        hasSpoken: playerRound.hasSpoken
      }
    ])
  );

  const revealedSecretsByPlayerId = round.revealSecret
    ? Object.fromEntries(
        Object.entries(round.playerRound).map(([playerId, playerRound]) => [
          playerId,
          {
            roleId: playerRound.roleId,
            chaosCardId: playerRound.chaosCardId
          }
        ])
      )
    : {};

  return {
    roundNumber: round.roundNumber,
    phase: round.phase,
    topicPrompt: round.topicPrompt,
    speakersRemaining: [...round.speakersRemaining],
    currentSpeakerId: round.currentSpeakerId,
    prepTimer: round.prepTimer,
    speakerTimer: round.speakerTimer,
    followUpTimer: round.followUpTimer,
    revealGuesses: round.revealGuesses,
    revealSecret: round.revealSecret,
    followUp: {
      requesterIds: [...round.followUp.requesterIds],
      selectedRequesterId: round.followUp.selectedRequesterId,
      awardedRequesterId: round.followUp.awardedRequesterId,
      locked: round.followUp.locked
    },
    guesses: guessesForPublic,
    guessCountsByTargetSpeakerId,
    speakerBonuses: round.revealSecret ? round.speakerBonuses : {},
    playerRoundPublic,
    revealedSecretsByPlayerId
  };
}

function buildPublicRoomState(room: RoomState): PublicRoomPayload {
  return {
    code: room.code,
    phase: room.phase,
    locked: room.locked,
    createdAtEpochMs: room.createdAtEpochMs,
    playerOrder: [...room.playerOrder],
    players: room.players,
    activeRound: buildPublicRoundView(room)
  };
}

export function buildTeacherPayload(room: RoomState, hostToken: string): TeacherPayload {
  const authorized = room.hostToken === hostToken;
  const round = room.activeRound;

  return {
    role: 'teacher',
    hostAuthorized: authorized,
    publicState: buildPublicRoomState(room),
    internals: {
      guesses: round ? round.guesses : {},
      followUp: round ? round.followUp : null,
      speakerBonuses: round ? round.speakerBonuses : null
    },
    playerPrivateStateById: round ? round.playerRound : {}
  };
}

export function buildStudentPayload(room: RoomState, playerId: string): StudentPayload {
  const publicState = buildPublicRoomState(room);
  const round = room.activeRound;
  const selfPrivateState = round?.playerRound[playerId]
    ? {
        ...round.playerRound[playerId]
      }
    : null;

  return {
    role: 'student',
    selfPlayerId: playerId,
    publicState,
    selfPrivateState
  };
}

export function buildViewerPayload(room: RoomState): ViewerPayload {
  return {
    role: 'viewer',
    publicState: buildPublicRoomState(room)
  };
}
