// All card content comes from @jys/shared (single source of truth shared with the server).
import type { RoleCard, ChaosCard } from '@jys/shared';

export type RoleCardView = RoleCard;
export type ChaosCardView = ChaosCard;

export {
  roleCardMap,
  chaosCardMap,
  getRoleCard,
  getChaosCard,
  roleLabel,
  chaosLabel
} from '@jys/shared';
