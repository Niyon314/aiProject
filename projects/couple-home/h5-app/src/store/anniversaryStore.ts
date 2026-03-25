import { create } from 'zustand';
import { anniversaryApi, type Anniversary } from '../api/anniversaryApi';

interface AnniversaryState {
  anniversaries: Anniversary[];
  upcomingAnniversaries: Anniversary[];
  daysTogether: any;
  loading: boolean;
  error: string | null;

  loadAnniversaries: () => Promise<void>;
  loadUpcoming: () => Promise<void>;
  loadDaysTogether: () => Promise<void>;
  addAnniversary: (data: Partial<Anniversary>) => Promise<void>;
  calculateDaysTogether: (dateStr: string) => number;
}

export const useAnniversaryStore = create<AnniversaryState>((set) => ({
  anniversaries: [],
  upcomingAnniversaries: [],
  daysTogether: null,
  loading: false,
  error: null,

  loadAnniversaries: async () => {
    set({ loading: true, error: null });
    try {
      const anniversaries = await anniversaryApi.getAll();
      set({ anniversaries: Array.isArray(anniversaries) ? anniversaries : [], loading: false });
    } catch {
      set({ error: '加载失败', loading: false });
    }
  },

  loadUpcoming: async () => {
    try {
      const upcomingAnniversaries = await anniversaryApi.getUpcoming();
      set({ upcomingAnniversaries: Array.isArray(upcomingAnniversaries) ? upcomingAnniversaries : [] });
    } catch {
      // silent
    }
  },

  loadDaysTogether: async () => {
    try {
      const data = await anniversaryApi.getDaysTogether();
      set({ daysTogether: data });
    } catch {
      // silent
    }
  },

  addAnniversary: async (data) => {
    set({ loading: true, error: null });
    try {
      const newItem = await anniversaryApi.create(data as any);
      set(state => ({
        anniversaries: [newItem, ...state.anniversaries],
        loading: false,
      }));
    } catch {
      set({ error: '添加失败', loading: false });
    }
  },

  calculateDaysTogether: (dateStr: string) => {
    const start = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  },
}));
