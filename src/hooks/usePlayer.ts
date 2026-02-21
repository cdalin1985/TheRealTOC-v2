import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/authStore';

const PLAYER_KEY = 'player';

/**
 * Gets the current user's linked player record.
 * When a user registers and a profile is created, the trigger
 * automatically creates a player record with that profile_id.
 */
export function useCurrentPlayer() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [PLAYER_KEY, 'current', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          display_name,
          fargo_rating,
          robustness,
          profile_id
        `)
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

/**
 * Gets a player's stats from their match history.
 */
export function usePlayerStats(playerId: string | null) {
  return useQuery({
    queryKey: [PLAYER_KEY, 'stats', playerId],
    queryFn: async () => {
      if (!playerId) return null;

      const { data, error } = await supabase
        .from('matches')
        .select('player1_id, player2_id, winner_id, status')
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('status', 'completed');

      if (error) throw error;

      const matches = data ?? [];
      const wins = matches.filter((m) => m.winner_id === playerId).length;
      const losses = matches.length - wins;

      return {
        matchesPlayed: matches.length,
        wins,
        losses,
        winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
      };
    },
    enabled: !!playerId,
  });
}
