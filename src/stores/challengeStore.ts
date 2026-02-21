import { create } from 'zustand';
import type { Challenge } from '@/types';

interface ChallengeState {
  challenges: Challenge[];
  incomingCount: number;
  outgoingCount: number;
  pendingCount: number;
  setChallenges: (challenges: Challenge[]) => void;
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  removeChallenge: (id: string) => void;
  updateCounts: () => void;
}

export const useChallengeStore = create<ChallengeState>()((set, get) => ({
  challenges: [],
  incomingCount: 0,
  outgoingCount: 0,
  pendingCount: 0,

  setChallenges: (challenges) => {
    set({ challenges });
    get().updateCounts();
  },

  addChallenge: (challenge) => {
    set((state) => ({ challenges: [challenge, ...state.challenges] }));
    get().updateCounts();
  },

  updateChallenge: (id, updates) => {
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().updateCounts();
  },

  removeChallenge: (id) => {
    set((state) => ({
      challenges: state.challenges.filter((c) => c.id !== id),
    }));
    get().updateCounts();
  },

  updateCounts: () => {
    const { challenges } = get();
    const incoming = challenges.filter(
      (c) => c.status === 'pending' && c.challengedId === 'current-user'
    ).length;
    const outgoing = challenges.filter(
      (c) => c.status === 'pending' && c.challengerId === 'current-user'
    ).length;
    set({
      incomingCount: incoming,
      outgoingCount: outgoing,
      pendingCount: incoming + outgoing,
    });
  },
}));