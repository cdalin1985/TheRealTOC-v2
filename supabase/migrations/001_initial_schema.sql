-- TheRealTOC Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE challenge_status AS ENUM (
  'pending', 'accepted', 'declined', 'cancelled', 'expired', 'venue_proposed', 'locked'
);

CREATE TYPE match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TYPE transaction_category AS ENUM (
  'match_fee', 'membership_dues', 'venue_rental', 'trophy_purchase', 'equipment', 'payout', 'other'
);

CREATE TYPE activity_type AS ENUM (
  'challenge_sent', 'challenge_accepted', 'challenge_declined', 'challenge_cancelled',
  'venue_proposed', 'match_confirmed', 'match_completed', 'score_submitted',
  'score_disputed', 'ranking_changed', 'player_joined', 'payment_received'
);

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Players (links profiles to game data)
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenges
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES players(id) ON DELETE CASCADE,
  challenged_id uuid REFERENCES players(id) ON DELETE CASCADE,
  status challenge_status DEFAULT 'pending',
  proposed_date date,
  proposed_time time,
  location text,
  notes text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Matches
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE SET NULL,
  player1_id uuid REFERENCES players(id) ON DELETE CASCADE,
  player2_id uuid REFERENCES players(id) ON DELETE CASCADE,
  status match_status DEFAULT 'scheduled',
  scheduled_at timestamptz,
  location text,
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  winner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rankings
CREATE TABLE rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  position integer NOT NULL,
  points integer DEFAULT 0,
  previous_position integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Treasury Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  related_match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activity Log
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type NOT NULL,
  actor_id uuid REFERENCES players(id) ON DELETE SET NULL,
  target_id uuid REFERENCES players(id) ON DELETE SET NULL,
  challenge_id uuid REFERENCES challenges(id) ON DELETE SET NULL,
  match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- League Settings
CREATE TABLE league_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_fee_per_player integer DEFAULT 500,
  season_name text DEFAULT 'Current Season',
  season_start_date date DEFAULT CURRENT_DATE,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO league_settings (match_fee_per_player) VALUES (500);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_rankings_player ON rankings(player_id);
CREATE INDEX idx_rankings_position ON rankings(position);
CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Players: Viewable by all
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT TO authenticated USING (true);

-- Challenges: Participants can view, involved players can update
CREATE POLICY "Challenges viewable by participants"
  ON challenges FOR SELECT TO authenticated
  USING (auth.uid() IN (
    SELECT profile_id FROM players WHERE id IN (challenger_id, challenged_id)
  ));

CREATE POLICY "Challenges insertable by authenticated"
  ON challenges FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Challenges updatable by participants"
  ON challenges FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT profile_id FROM players WHERE id IN (challenger_id, challenged_id)
  ));

-- Matches: Viewable by all, updatable by participants
CREATE POLICY "Matches viewable by everyone"
  ON matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Matches updatable by participants"
  ON matches FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT profile_id FROM players WHERE id IN (player1_id, player2_id)
  ));

-- Rankings: Viewable by all
CREATE POLICY "Rankings viewable by everyone"
  ON rankings FOR SELECT TO authenticated USING (true);

-- Transactions: Viewable by all (transparency), insertable by admins
CREATE POLICY "Transactions viewable by everyone"
  ON transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can add transactions"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Activity Log: Viewable by all
CREATE POLICY "Activity log viewable by everyone"
  ON activity_log FOR SELECT TO authenticated USING (true);

-- League Settings: Viewable by all, updatable by admins
CREATE POLICY "Settings viewable by everyone"
  ON league_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can update settings"
  ON league_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log challenge created
CREATE OR REPLACE FUNCTION log_challenge_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (type, actor_id, target_id, challenge_id, description)
  VALUES ('challenge_sent', NEW.challenger_id, NEW.challenged_id, NEW.id,
    'Challenge sent to player');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_created_trigger
  AFTER INSERT ON challenges
  FOR EACH ROW EXECUTE FUNCTION log_challenge_created();

-- Log match completed
CREATE OR REPLACE FUNCTION log_match_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO activity_log (type, actor_id, target_id, match_id, description, metadata)
    VALUES ('match_completed', NEW.winner_id,
      CASE WHEN NEW.winner_id = NEW.player1_id THEN NEW.player2_id ELSE NEW.player1_id END,
      NEW.id, 'Match completed', jsonb_build_object(
        'player1_score', NEW.player1_score,
        'player2_score', NEW.player2_score,
        'winner_id', NEW.winner_id
      ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_completed_trigger
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION log_match_completed();

-- Create player on profile insert
CREATE OR REPLACE FUNCTION create_player_for_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO players (profile_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_created_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_player_for_profile();
