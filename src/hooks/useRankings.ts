import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export interface RankedPlayer {
  id: string;
  displayName: string;
  fargoRating: number | null;
  robustness: number | null;
  position: number;
  previousPosition: number | null;
  points: number;
}

const RANKINGS_KEY = 'rankings';

export function useRankings() {
  return useQuery({
    queryKey: [RANKINGS_KEY],
    queryFn: async (): Promise<RankedPlayer[]> => {
      const { data, error } = await supabase
        .from('rankings')
        .select(`
          position,
          previous_position,
          points,
          player:players!inner(
            id,
            display_name,
            fargo_rating,
            robustness
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.player.id,
        displayName: r.player.display_name,
        fargoRating: r.player.fargo_rating,
        robustness: r.player.robustness,
        position: r.position,
        previousPosition: r.previous_position,
        points: r.points,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlayerProfile(playerId: string | undefined) {
  return useQuery({
    queryKey: [RANKINGS_KEY, 'player', playerId],
    queryFn: async () => {
      if (!playerId) return null;

      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          display_name,
          fargo_rating,
          robustness,
          profile_id
        `)
        .eq('id', playerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });
}
