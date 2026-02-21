// =============================================================================
// Core Domain Types
// =============================================================================

export type ID = string;

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Entity extends Timestamped {
  id: ID;
}

// =============================================================================
// User & Authentication
// =============================================================================

export interface User extends Entity {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// =============================================================================
// Player & Profile
// =============================================================================

export interface Player extends Entity {
  userId: ID;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  fargoRating: number | null;
  robustness: number | null;
}

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  totalPoints: number;
}

// =============================================================================
// Challenge System
// =============================================================================

export type ChallengeStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'cancelled' 
  | 'expired'
  | 'venue_proposed'
  | 'locked';

export interface Challenge extends Entity {
  challengerId: ID;
  challengedId: ID;
  status: ChallengeStatus;
  proposedDate: string | null;
  proposedTime: string | null;
  location: string | null;
  notes: string | null;
  expiresAt: string | null;
  challenger?: Player;
  challenged?: Player;
}

// =============================================================================
// Match System
// =============================================================================

export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface Match extends Entity {
  challengeId: ID;
  player1Id: ID;
  player2Id: ID;
  status: MatchStatus;
  scheduledAt: string | null;
  location: string | null;
  player1Score: number;
  player2Score: number;
  winnerId: ID | null;
  startedAt: string | null;
  completedAt: string | null;
  player1?: Player;
  player2?: Player;
  winner?: Player;
}

export interface MatchSet {
  id: ID;
  matchId: ID;
  setNumber: number;
  player1Games: number;
  player2Games: number;
  tiebreak: boolean;
  player1TiebreakPoints: number | null;
  player2TiebreakPoints: number | null;
}

// =============================================================================
// Rankings
// =============================================================================

export interface Ranking extends Entity {
  playerId: ID;
  position: number;
  points: number;
  previousPosition: number | null;
  player?: Player;
}

// =============================================================================
// Treasury
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

export interface Transaction extends Entity {
  playerId: ID | null;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedMatchId: ID | null;
  adminId: ID | null;
  balanceAfter: number;
  player?: Player;
}

export interface PlayerFinancialSummary {
  playerId: ID;
  totalMatchFeesPaid: number;
  totalWinningsReceived: number;
  totalMembershipPaid: number;
  netContribution: number;
  updatedAt: string;
}

// =============================================================================
// Activity Feed
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

export interface Activity extends Entity {
  type: ActivityType;
  actorId: ID | null;
  targetId: ID | null;
  challengeId: ID | null;
  matchId: ID | null;
  description: string;
  metadata: Record<string, unknown>;
  actor?: Player;
  target?: Player;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// =============================================================================
// UI Types
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}