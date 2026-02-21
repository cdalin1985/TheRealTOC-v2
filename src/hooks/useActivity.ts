import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

const ACTIVITY_KEY = 'activity';

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: [ACTIVITY_KEY, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          actor:players!activity_log_actor_id_fkey(id, display_name),
          target:players!activity_log_target_id_fkey(id, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}
