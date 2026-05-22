import type { RoomPhase, SpeakerBonusCategory } from '@jys/shared';

export type AnyPayload = any;
export type GuessResult = 'exact' | 'partial' | 'miss';

export const ROOM_PHASE = {
  prep: 'prep',
  speaking: 'speaking'
} as const satisfies Record<'prep' | 'speaking', RoomPhase>;

export const bonusCategories: Array<{ id: SpeakerBonusCategory; label: string }> = [
  { id: 'used_idiom', label: 'Used an idiom' },
  { id: 'used_advanced_sentence_structure', label: 'Used an advanced sentence structure' },
  { id: 'completed_chaos_card', label: 'Completed the chaos card' },
  { id: 'fulfilled_role', label: 'Fulfilled the role' },
  { id: 'almost_no_grammar_or_pronunciation_mistakes', label: 'Had almost no grammar or pronunciation mistakes' }
];

export const roleOptions = ['role-1', 'role-2', 'role-3', 'role-4', 'role-5'];
export const chaosOptions = ['chaos-1', 'chaos-2', 'chaos-3', 'chaos-4', 'chaos-5'];
