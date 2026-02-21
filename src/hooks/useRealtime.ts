import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

/**
 * Subscribes to Supabase realtime changes on key tables
 * and auto-invalidates the relevant React Query caches.
 * This means all connected devices see updates immediately.
 */
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('app-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['challenges'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matches'] });
          queryClient.invalidateQueries({ queryKey: ['player'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['treasury'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rankings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['rankings'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['rankings'] });
          queryClient.invalidateQueries({ queryKey: ['player'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
