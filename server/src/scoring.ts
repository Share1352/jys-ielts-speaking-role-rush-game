import type { GuessResult, GuessSubmission, SpeakerBonusCategory } from './state.js';

export function pointsForGuessResult(result: GuessResult): number {
  if (result === 'exact') return 2;
  if (result === 'partial') return 1;
  return 0;
}

export function scoreGuess(guess: GuessSubmission): number {
  return pointsForGuessResult(guess.roleResult ?? 'miss') + pointsForGuessResult(guess.chaosResult ?? 'miss');
}

export function speakerBonusPoints(bonuses: Partial<Record<SpeakerBonusCategory, boolean>>): number {
  return Object.values(bonuses).filter(Boolean).length;
}

export function rerollPenaltyTotal(rolePenalty: number, chaosPenalty: number): number {
  return rolePenalty + chaosPenalty;
}
