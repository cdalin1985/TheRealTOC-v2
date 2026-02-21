import { create } from 'zustand';
import type { AuthState, User, AuthTokens } from '@/types';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (user, tokens) => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...updates, updatedAt: new Date().toISOString() } });
  },
}));