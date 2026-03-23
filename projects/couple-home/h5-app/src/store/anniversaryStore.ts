import { create } from 'zustand';
import { anniversaryApi, type Anniversary, type DaysTogetherResponse } from '../api/anniversaryApi';

interface AnniversaryState {
  // 状态
  anniversaries: Anniversary[];
  upcomingAnniversaries: Anniversary[];
  daysTogether: DaysTogetherResponse | null;
  isLoading: boolean;

  // Actions
  loadAnniversaries: () => Promise<void>;
  loadUpcoming: () => Promise<void>;
  loadDaysTogether: () => Promise<void>;
  createAnniversary: (data: {
    name: string;
    date: string;
    icon: string;
    type: 'festival' | 'birthday' | 'relationship' | 'other';
    year: number;
    isLunar: boolean;
    reminderDays: number[];
    notes?: string;
  }) => Promise<void>;
  updateAnniversary: (id: string, updates: Partial<Anniversary>) => Promise<void>;
  deleteAnniversary: (id: string) => Promise<void>;
}

export const useAnniversaryStore = create<AnniversaryState>((set, get) => ({
  // 初始状态
  anniversaries: [],
  upcomingAnniversaries: [],
  daysTogether: null,
  isLoading: false,

  // 加载纪念日列表
  loadAnniversaries: async () => {
    set({ isLoading: true });
    try {
      const anniversaries = await anniversaryApi.getAll();
      set({ anniversaries, isLoading: false });
    } catch (error) {
      console.error('Failed to load anniversaries:', error);
      set({ isLoading: false });
    }
  },

  // 加载即将到来的纪念日
  loadUpcoming: async () => {
    try {
      const upcomingAnniversaries = await anniversaryApi.getUpcoming();
      set({ upcomingAnniversaries });
    } catch (error) {
      console.error('Failed to load upcoming anniversaries:', error);
    }
  },

  // 加载在一起天数
  loadDaysTogether: async () => {
    try {
      const daysTogether = await anniversaryApi.getDaysTogether();
      set({ daysTogether });
    } catch (error) {
      console.error('Failed to load days together:', error);
    }
  },

  // 创建纪念日
  createAnniversary: async (data) => {
    try {
      await anniversaryApi.create(data);
      await get().loadAnniversaries();
    } catch (error) {
      console.error('Failed to create anniversary:', error);
      throw error;
    }
  },

  // 更新纪念日
  updateAnniversary: async (id, updates) => {
    try {
      await anniversaryApi.update(id, updates);
      await get().loadAnniversaries();
    } catch (error) {
      console.error('Failed to update anniversary:', error);
      throw error;
    }
  },

  // 删除纪念日
  deleteAnniversary: async (id) => {
    try {
      await anniversaryApi.delete(id);
      await get().loadAnniversaries();
    } catch (error) {
      console.error('Failed to delete anniversary:', error);
      throw error;
    }
  },
}));
