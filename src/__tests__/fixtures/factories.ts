/**
 * Test Factories - Generate mock data for tests
 * 
 * Using the Factory pattern to create consistent, type-safe test data
 * that follows the same structure as the actual application types.
 */

import type {
  User,
  Player,
  PlayerStats,
  Challenge,
  Match,
  MatchSet,
  Ranking,
  Transaction,
  Activity,
  AuthTokens,
} from '@/types';

// =============================================================================
// ID Generator
// =============================================================================

let idCounter = 0;
export function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

// =============================================================================
// Timestamp Generator
// =============================================================================

export function generateTimestamp(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// =============================================================================
// User Factory
// =============================================================================

export interface UserFactoryOverrides {
  id?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function createUser(overrides: UserFactoryOverrides = {}): User {
  const now = generateTimestamp();
  return {
    id: overrides.id ?? generateId('user'),
    email: overrides.email ?? `user-${idCounter}@example.com`,
    displayName: overrides.displayName ?? `User ${idCounter}`,
    avatarUrl: overrides.avatarUrl ?? null,
    isAdmin: overrides.isAdmin ?? false,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

export function createAdminUser(overrides: UserFactoryOverrides = {}): User {
  return createUser({ ...overrides, isAdmin: true });
}

// =============================================================================
// Player Factory
// =============================================================================

export interface PlayerFactoryOverrides {
  id?: string;
  userId?: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  fargoRating?: number | null;
  robustness?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export function createPlayer(overrides: PlayerFactoryOverrides = {}): Player {
  const now = generateTimestamp();
  return {
    id: overrides.id ?? generateId('player'),
    userId: overrides.userId ?? generateId('user'),
    displayName: overrides.displayName ?? `Player ${idCounter}`,
    avatarUrl: overrides.avatarUrl ?? null,
    bio: overrides.bio ?? null,
    location: overrides.location ?? null,
    fargoRating: overrides.fargoRating ?? 500 + Math.floor(Math.random() * 300),
    robustness: overrides.robustness ?? Math.floor(Math.random() * 100),
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

// =============================================================================
// PlayerStats Factory
// =============================================================================

export interface PlayerStatsFactoryOverrides {
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  winRate?: number;
  totalPoints?: number;
}

export function createPlayerStats(overrides: PlayerStatsFactoryOverrides = {}): PlayerStats {
  const matchesPlayed = overrides.matchesPlayed ?? 10;
  const matchesWon = overrides.matchesWon ?? 6;
  const matchesLost = overrides.matchesLost ?? (matchesPlayed - matchesWon);

  return {
    matchesPlayed,
    matchesWon,
    matchesLost,
    winRate: overrides.winRate ?? (matchesWon / matchesPlayed) * 100,
    totalPoints: overrides.totalPoints ?? matchesWon * 3,
  };
}

// =============================================================================
// Challenge Factory
// =============================================================================

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired' | 'venue_proposed' | 'locked';

export interface ChallengeFactoryOverrides {
  id?: string;
  challengerId?: string;
  challengedId?: string;
  status?: ChallengeStatus;
  proposedDate?: string | null;
  proposedTime?: string | null;
  location?: string | null;
  notes?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  challenger?: Player;
  challenged?: Player;
}

export function createChallenge(overrides: ChallengeFactoryOverrides = {}): Challenge {
  const now = generateTimestamp();
  const challengerId = overrides.challengerId ?? generateId('player');
  const challengedId = overrides.challengedId ?? generateId('player');

  return {
    id: overrides.id ?? generateId('challenge'),
    challengerId,
    challengedId,
    status: (overrides.status ?? 'pending') as Challenge['status'],
    proposedDate: overrides.proposedDate ?? null,
    proposedTime: overrides.proposedTime ?? null,
    location: overrides.location ?? null,
    notes: overrides.notes ?? null,
    expiresAt: overrides.expiresAt ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    challenger: overrides.challenger ?? createPlayer({ id: challengerId }),
    challenged: overrides.challenged ?? createPlayer({ id: challengedId }),
  };
}

export function createPendingChallenge(overrides: ChallengeFactoryOverrides = {}): Challenge {
  return createChallenge({ ...overrides, status: 'pending' });
}

export function createAcceptedChallenge(overrides: ChallengeFactoryOverrides = {}): Challenge {
  return createChallenge({ ...overrides, status: 'accepted' });
}

export function createExpiredChallenge(overrides: ChallengeFactoryOverrides = {}): Challenge {
  return createChallenge({ 
    ...overrides, 
    status: 'expired',
    expiresAt: generateTimestamp(1), // Expired yesterday
  });
}

// =============================================================================
// Match Factory
// =============================================================================

export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface MatchFactoryOverrides {
  id?: string;
  challengeId?: string;
  player1Id?: string;
  player2Id?: string;
  status?: MatchStatus;
  scheduledAt?: string | null;
  location?: string | null;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  player1?: Player;
  player2?: Player;
  winner?: Player | null;
}

export function createMatch(overrides: MatchFactoryOverrides = {}): Match {
  const now = generateTimestamp();
  const player1Id = overrides.player1Id ?? generateId('player');
  const player2Id = overrides.player2Id ?? generateId('player');

  return {
    id: overrides.id ?? generateId('match'),
    challengeId: overrides.challengeId ?? generateId('challenge'),
    player1Id,
    player2Id,
    status: (overrides.status ?? 'scheduled') as Match['status'],
    scheduledAt: overrides.scheduledAt ?? null,
    location: overrides.location ?? null,
    player1Score: overrides.player1Score ?? 0,
    player2Score: overrides.player2Score ?? 0,
    winnerId: overrides.winnerId ?? null,
    startedAt: overrides.startedAt ?? null,
    completedAt: overrides.completedAt ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    player1: overrides.player1 ?? createPlayer({ id: player1Id }),
    player2: overrides.player2 ?? createPlayer({ id: player2Id }),
    winner: overrides.winner ?? undefined,
  };
}

export function createCompletedMatch(overrides: MatchFactoryOverrides = {}): Match {
  const player1Id = overrides.player1Id ?? generateId('player');
  const player2Id = overrides.player2Id ?? generateId('player');
  const winnerId = overrides.winnerId ?? player1Id;

  return createMatch({
    ...overrides,
    status: 'completed',
    player1Id,
    player2Id,
    winnerId,
    player1Score: 5,
    player2Score: 3,
    completedAt: generateTimestamp(),
  });
}

// =============================================================================
// MatchSet Factory
// =============================================================================

export interface MatchSetFactoryOverrides {
  id?: string;
  matchId?: string;
  setNumber?: number;
  player1Games?: number;
  player2Games?: number;
  tiebreak?: boolean;
  player1TiebreakPoints?: number | null;
  player2TiebreakPoints?: number | null;
}

export function createMatchSet(overrides: MatchSetFactoryOverrides = {}): MatchSet {
  return {
    id: overrides.id ?? generateId('set'),
    matchId: overrides.matchId ?? generateId('match'),
    setNumber: overrides.setNumber ?? 1,
    player1Games: overrides.player1Games ?? 6,
    player2Games: overrides.player2Games ?? 4,
    tiebreak: overrides.tiebreak ?? false,
    player1TiebreakPoints: overrides.player1TiebreakPoints ?? null,
    player2TiebreakPoints: overrides.player2TiebreakPoints ?? null,
  };
}

// =============================================================================
// Ranking Factory
// =============================================================================

export interface RankingFactoryOverrides {
  id?: string;
  playerId?: string;
  position?: number;
  points?: number;
  previousPosition?: number | null;
  createdAt?: string;
  updatedAt?: string;
  player?: Player;
}

export function createRanking(overrides: RankingFactoryOverrides = {}): Ranking {
  const now = generateTimestamp();
  const position = overrides.position ?? 1;

  return {
    id: overrides.id ?? generateId('ranking'),
    playerId: overrides.playerId ?? generateId('player'),
    position,
    points: overrides.points ?? 1000 - position * 10,
    previousPosition: overrides.previousPosition ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    player: overrides.player ?? createPlayer({ id: overrides.playerId ?? generateId('player') }),
  };
}

export function createRankingList(count: number): Ranking[] {
  return Array.from({ length: count }, (_, i) =>
    createRanking({ position: i + 1 })
  );
}

// =============================================================================
// Transaction Factory
// =============================================================================

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'match_fee'
  | 'membership_dues'
  | 'venue_rental'
  | 'trophy_purchase'
  | 'equipment'
  | 'payout'
  | 'other';

export interface TransactionFactoryOverrides {
  id?: string;
  playerId?: string | null;
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  description?: string;
  relatedMatchId?: string | null;
  adminId?: string | null;
  balanceAfter?: number;
  createdAt?: string;
  updatedAt?: string;
  player?: Player | null;
}

export function createTransaction(overrides: TransactionFactoryOverrides = {}): Transaction {
  const now = generateTimestamp();
  const type = overrides.type ?? 'income';
  const amount = overrides.amount ?? 50;

  return {
    id: overrides.id ?? generateId('transaction'),
    playerId: overrides.playerId ?? null,
    type,
    category: overrides.category ?? 'match_fee',
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    description: overrides.description ?? `Test ${type}`,
    relatedMatchId: overrides.relatedMatchId ?? null,
    adminId: overrides.adminId ?? null,
    balanceAfter: overrides.balanceAfter ?? 1000,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    player: overrides.player ?? undefined,
  };
}

export function createMatchFeeTransaction(playerId: string, amount = 20): Transaction {
  return createTransaction({
    playerId,
    type: 'income',
    category: 'match_fee',
    amount,
    description: 'Match fee payment',
  });
}

// =============================================================================
// Activity Factory
// =============================================================================

export type ActivityType =
  | 'challenge_sent'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'challenge_cancelled'
  | 'venue_proposed'
  | 'match_confirmed'
  | 'match_completed'
  | 'score_submitted'
  | 'score_disputed'
  | 'ranking_changed'
  | 'player_joined'
  | 'payment_received';

export interface ActivityFactoryOverrides {
  id?: string;
  type?: ActivityType;
  actorId?: string | null;
  targetId?: string | null;
  challengeId?: string | null;
  matchId?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  actor?: Player | null;
  target?: Player | null;
}

export function createActivity(overrides: ActivityFactoryOverrides = {}): Activity {
  const now = generateTimestamp();
  const type = overrides.type ?? 'challenge_sent';

  return {
    id: overrides.id ?? generateId('activity'),
    type,
    actorId: overrides.actorId ?? generateId('player'),
    targetId: overrides.targetId ?? generateId('player'),
    challengeId: overrides.challengeId ?? null,
    matchId: overrides.matchId ?? null,
    description: overrides.description ?? `Test ${type}`,
    metadata: overrides.metadata ?? {},
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    actor: overrides.actor ?? createPlayer({ id: overrides.actorId as string }),
    target: overrides.target ?? createPlayer({ id: overrides.targetId as string }),
  };
}

// =============================================================================
// AuthTokens Factory
// =============================================================================

export interface AuthTokensFactoryOverrides {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export function createAuthTokens(overrides: AuthTokensFactoryOverrides = {}): AuthTokens {
  return {
    accessToken: overrides.accessToken ?? `access-token-${generateId('token')}`,
    refreshToken: overrides.refreshToken ?? `refresh-token-${generateId('token')}`,
    expiresAt: overrides.expiresAt ?? Date.now() + 3600000,
  };
}

// =============================================================================
// Collection Builders
// =============================================================================

export function createChallengeList(count: number): Challenge[] {
  return Array.from({ length: count }, (_, i) =>
    createChallenge({ status: i % 2 === 0 ? 'pending' : 'accepted' })
  );
}

export function createMatchList(count: number): Match[] {
  return Array.from({ length: count }, (_, i) =>
    createMatch({ status: i % 2 === 0 ? 'scheduled' : 'completed' })
  );
}

export function createPlayerList(count: number): Player[] {
  return Array.from({ length: count }, () => createPlayer());
}

export function createActivityList(count: number): Activity[] {
  const types: ActivityType[] = [
    'challenge_sent',
    'challenge_accepted',
    'match_completed',
    'ranking_changed',
  ];
  return Array.from({ length: count }, (_, i) =>
    createActivity({ type: types[i % types.length] })
  );
}

// =============================================================================
// Reset Counter (useful between tests)
// =============================================================================

export function resetFactoryCounter(): void {
  idCounter = 0;
}
