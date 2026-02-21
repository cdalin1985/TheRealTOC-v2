import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { User, AuthTokens } from '@/types';

const AUTH_KEY = 'auth';

export function useCurrentUser() {
  return useQuery({
    queryKey: [AUTH_KEY, 'user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user as User | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      const tokens: AuthTokens = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? Date.now() + 3600000,
      };
      await storeLogin(data.user as User, tokens);
      queryClient.setQueryData([AUTH_KEY, 'user'], data.user);
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data.session) {
        const tokens: AuthTokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at ?? Date.now() + 3600000,
        };
        await storeLogin(data.user as User, tokens);
        queryClient.setQueryData([AUTH_KEY, 'user'], data.user);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: async () => {
      await storeLogout();
      queryClient.clear();
    },
  });
}

export function useAuthInit() {
  const { setLoading, setUser } = useAuthStore();

  const init = useCallback(async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    setUser(user as User);
    setLoading(false);
  }, [setLoading, setUser]);

  return { init };
}