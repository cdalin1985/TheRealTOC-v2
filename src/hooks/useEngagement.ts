import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

const ENGAGEMENT_KEY = 'engagement';

export interface WinStreak {
  playerId: string;
  playerName: string;
  streak: number;
}

export interface SeasonStats {
  totalMatches: number;
  totalChallenges: number;
  activeChallenges: number;
  mostWantedId: string | null;
  mostWantedName: string | null;
  mostWantedChallenges: number;
  topWinStreak: WinStreak | null;
  recentWinners: { playerId: string; playerName: string; wins: number }[];
}

/**
 * Calculates season-level engagement stats from matches and challenges.
 */
export function useSeasonStats() {
  return useQuery({
    queryKey: [ENGAGEMENT_KEY, 'season'],
    queryFn: async (): Promise<SeasonStats> => {
      // Fetch all matches and challenges in parallel
      const [matchesResult, challengesResult] = await Promise.all([
        supabase
          .from('matches')
          .select('id, player1_id, player2_id, winner_id, status, completed_at, player1:players!matches_player1_id_fkey(display_name), player2:players!matches_player2_id_fkey(display_name)')
          .order('completed_at', { ascending: false }),
        supabase
          .from('challenges')
          .select('id, challenger_id, challenged_id, status'),
      ]);

      const matches = matchesResult.data ?? [];
      const challenges = challengesResult.data ?? [];

      // Total counts
      const totalMatches = matches.filter((m) => m.status === 'completed').length;
      const totalChallenges = challenges.length;
      const activeChallenges = challenges.filter((c) => c.status === 'pending' || c.status === 'accepted').length;

      // Most challenged player (most wanted)
      const challengedCount = new Map<string, { count: number; name: string }>();
      for (const c of challenges) {
        if (!c.challenged_id) continue;
        const existing = challengedCount.get(c.challenged_id) ?? { count: 0, name: '' };
        existing.count++;
        challengedCount.set(c.challenged_id, existing);
      }

      let mostWantedId: string | null = null;
      let mostWantedName: string | null = null;
      let mostWantedChallenges = 0;
      for (const [id, info] of challengedCount) {
        if (info.count > mostWantedChallenges) {
          mostWantedChallenges = info.count;
          mostWantedId = id;
        }
      }

      // Get name for most wanted
      if (mostWantedId) {
        const { data: player } = await supabase
          .from('players')
          .select('display_name')
          .eq('id', mostWantedId)
          .single();
        mostWantedName = player?.display_name ?? null;
      }

      // Win streaks - check completed matches ordered by date
      const completedMatches = matches
        .filter((m) => m.status === 'completed' && m.winner_id)
        .sort((a, b) => new Date(b.completed_at ?? b.id).getTime() - new Date(a.completed_at ?? a.id).getTime());

      // Track current win streak for each player
      const playerStreaks = new Map<string, { current: number; name: string }>();

      // We need to process matches chronologically per player
      const playerMatches = new Map<string, { won: boolean; date: string }[]>();
      for (const m of completedMatches) {
        const p1 = m.player1_id;
        const p2 = m.player2_id;
        if (p1) {
          const list = playerMatches.get(p1) ?? [];
          list.push({ won: m.winner_id === p1, date: m.completed_at ?? '' });
          playerMatches.set(p1, list);
        }
        if (p2) {
          const list = playerMatches.get(p2) ?? [];
          list.push({ won: m.winner_id === p2, date: m.completed_at ?? '' });
          playerMatches.set(p2, list);
        }
      }

      // Calculate current win streak (consecutive wins from most recent)
      let topWinStreak: WinStreak | null = null;
      for (const [playerId, matchList] of playerMatches) {
        let streak = 0;
        for (const m of matchList) {
          if (m.won) streak++;
          else break;
        }
        if (streak > 0 && (topWinStreak === null || streak > topWinStreak.streak)) {
          // Get player name
          const nameMatch = completedMatches.find(
            (cm) => cm.player1_id === playerId || cm.player2_id === playerId
          );
          const name = nameMatch
            ? (nameMatch.player1_id === playerId
                ? (nameMatch.player1 as any)?.display_name
                : (nameMatch.player2 as any)?.display_name) ?? 'Unknown'
            : 'Unknown';

          topWinStreak = { playerId, playerName: name, streak };
        }
        playerStreaks.set(playerId, { current: streak, name: '' });
      }

      // Top recent winners (most wins overall)
      const winCounts = new Map<string, { wins: number; name: string }>();
      for (const m of completedMatches) {
        if (!m.winner_id) continue;
        const existing = winCounts.get(m.winner_id) ?? { wins: 0, name: '' };
        existing.wins++;
        const nameMatch = m.player1_id === m.winner_id
          ? (m.player1 as any)?.display_name
          : (m.player2 as any)?.display_name;
        existing.name = nameMatch ?? 'Unknown';
        winCounts.set(m.winner_id, existing);
      }

      const recentWinners = Array.from(winCounts.entries())
        .map(([playerId, { wins, name }]) => ({ playerId, playerName: name, wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5);

      return {
        totalMatches,
        totalChallenges,
        activeChallenges,
        mostWantedId,
        mostWantedName,
        mostWantedChallenges,
        topWinStreak,
        recentWinners,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Get win streak for a specific player.
 */
export function usePlayerWinStreak(playerId: string | null) {
  return useQuery({
    queryKey: [ENGAGEMENT_KEY, 'streak', playerId],
    queryFn: async (): Promise<number> => {
      if (!playerId) return 0;

      const { data } = await supabase
        .from('matches')
        .select('winner_id')
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (!data) return 0;

      let streak = 0;
      for (const m of data) {
        if (m.winner_id === playerId) streak++;
        else break;
      }
      return streak;
    },
    enabled: !!playerId,
  });
}
