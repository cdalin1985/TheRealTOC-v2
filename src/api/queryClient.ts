import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: { retry: 1, retryDelay: 1000 },
  },
});

export const queryStorage = {
  getItem: async (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  removeItem: async (key: string): Promise<void> => AsyncStorage.removeItem(key),
};