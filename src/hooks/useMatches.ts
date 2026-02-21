import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

const MATCHES_KEY = 'matches';

export function useMatches() {
  return useQuery({
    queryKey: [MATCHES_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(id, display_name, fargo_rating),
          player2:players!matches_player2_id_fkey(id, display_name, fargo_rating),
          winner:players!matches_winner_id_fkey(id, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyMatches(playerIdOrNull: string | null) {
  return useQuery({
    queryKey: [MATCHES_KEY, 'mine', playerIdOrNull],
    queryFn: async () => {
      if (!playerIdOrNull) return [];

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(id, display_name, fargo_rating),
          player2:players!matches_player2_id_fkey(id, display_name, fargo_rating),
          winner:players!matches_winner_id_fkey(id, display_name)
        `)
        .or(`player1_id.eq.${playerIdOrNull},player2_id.eq.${playerIdOrNull}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!playerIdOrNull,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      player1Id,
      player2Id,
      scheduledAt,
      location,
    }: {
      challengeId?: string;
      player1Id: string;
      player2Id: string;
      scheduledAt?: string;
      location?: string;
    }) => {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          challenge_id: challengeId || null,
          player1_id: player1Id,
          player2_id: player2Id,
          scheduled_at: scheduledAt || null,
          location: location || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
    },
  });
}

export function useUpdateMatchScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      player1Score,
      player2Score,
      winnerId,
      submittedBy,
    }: {
      matchId: string;
      player1Score: number;
      player2Score: number;
      winnerId: string;
      submittedBy: string;
    }) => {
      // Get match to determine which player is submitting
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('player1_id, player2_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      const isPlayer1 = match.player1_id === submittedBy;
      const confirmField = isPlayer1 ? 'player1_confirmed' : 'player2_confirmed';

      const { data, error } = await supabase
        .from('matches')
        .update({
          player1_score: player1Score,
          player2_score: player2Score,
          winner_id: winnerId,
          submitted_by: submittedBy,
          [confirmField]: true,
          status: 'in_progress',
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
    },
  });
}

/**
 * Confirm a match score that was submitted by the other player.
 * Once both players confirm, the trigger auto-completes the match.
 */
export function useConfirmMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      playerId,
    }: {
      matchId: string;
      playerId: string;
    }) => {
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('player1_id, player2_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      const isPlayer1 = match.player1_id === playerId;
      const confirmField = isPlayer1 ? 'player1_confirmed' : 'player2_confirmed';

      const { data, error } = await supabase
        .from('matches')
        .update({ [confirmField]: true })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
    },
  });
}

/**
 * Dispute a match score that was submitted by the other player.
 */
export function useDisputeMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId }: { matchId: string }) => {
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'disputed' })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
    },
  });
}
