import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

const CHALLENGES_KEY = 'challenges';

export function useChallenges() {
  return useQuery({
    queryKey: [CHALLENGES_KEY],
    queryFn: async () => {
      // Expire overdue challenges on each fetch (belt-and-suspenders with pg_cron)
      try {
        await supabase.rpc('expire_overdue_challenges');
      } catch {
        // Ignore errors - pg_cron will handle it
      }

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:players!challenges_challenger_id_fkey(id, display_name, fargo_rating),
          challenged:players!challenges_challenged_id_fkey(id, display_name, fargo_rating)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyChallenges(playerIdOrNull: string | null) {
  return useQuery({
    queryKey: [CHALLENGES_KEY, 'mine', playerIdOrNull],
    queryFn: async () => {
      if (!playerIdOrNull) return [];

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:players!challenges_challenger_id_fkey(id, display_name, fargo_rating),
          challenged:players!challenges_challenged_id_fkey(id, display_name, fargo_rating)
        `)
        .or(`challenger_id.eq.${playerIdOrNull},challenged_id.eq.${playerIdOrNull}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!playerIdOrNull,
  });
}

export function useSendChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengerId,
      challengedId,
      proposedDate,
      proposedTime,
      location,
      notes,
    }: {
      challengerId: string;
      challengedId: string;
      proposedDate?: string;
      proposedTime?: string;
      location?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          proposed_date: proposedDate || null,
          proposed_time: proposedTime || null,
          location: location || null,
          notes: notes || null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHALLENGES_KEY] });
    },
  });
}

export function useRespondToChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      status,
    }: {
      challengeId: string;
      status: 'accepted' | 'declined' | 'cancelled';
    }) => {
      const { data, error } = await supabase
        .from('challenges')
        .update({ status })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHALLENGES_KEY] });
    },
  });
}
