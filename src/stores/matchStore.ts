import { create } from 'zustand';
import type { Match } from '@/types';

interface MatchState {
  matches: Match[];
  upcomingMatches: Match[];
  completedMatches: Match[];
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  categorizeMatches: () => void;
}

export const useMatchStore = create<MatchState>()((set, get) => ({
  matches: [],
  upcomingMatches: [],
  completedMatches: [],

  setMatches: (matches) => {
    set({ matches });
    get().categorizeMatches();
  },

  addMatch: (match) => {
    set((state) => ({ matches: [match, ...state.matches] }));
    get().categorizeMatches();
  },

  updateMatch: (id, updates) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
    get().categorizeMatches();
  },

  categorizeMatches: () => {
    const { matches } = get();
    const upcoming = matches.filter(
      (m) => m.status === 'scheduled' || m.status === 'in_progress'
    );
    const completed = matches.filter((m) => m.status === 'completed');
    set({ upcomingMatches: upcoming, completedMatches: completed });
  },
}));