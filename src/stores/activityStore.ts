import { create } from 'zustand';
import type { Activity } from '@/types';

interface ActivityState {
  activities: Activity[];
  unreadCount: number;
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useActivityStore = create<ActivityState>()((set) => ({
  activities: [],
  unreadCount: 0,

  setActivities: (activities) => set({ activities, unreadCount: activities.length }),

  addActivity: (activity) => {
    set((state) => ({
      activities: [activity, ...state.activities],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => set({ unreadCount: 0 }),
}));