import { create } from 'zustand';
import { choreApi, type Chore, type UserStats, type LeaderboardEntry } from '../api/choreApi';

interface ChoreState {
  // 状态
  chores: Chore[];
  userStats: UserStats | null;
  partnerStats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  weekProgress: { completed: number; total: number };

  // Actions
  loadChores: () => Promise<void>;
  claimChore: (id: string) => Promise<void>;
  completeChore: (id: string, proofPhoto?: string, notes?: string) => Promise<void>;
  loadStats: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
}

export const useChoreStore = create<ChoreState>((set, get) => ({
  // 初始状态
  chores: [],
  userStats: null,
  partnerStats: null,
  leaderboard: [],
  isLoading: false,
  weekProgress: { completed: 0, total: 0 },

  // 加载任务列表
  loadChores: async () => {
    set({ isLoading: true });
    try {
      const chores = await choreApi.getChores();
      set({ chores, isLoading: false });
    } catch (error) {
      console.error('Failed to load chores:', error);
      set({ isLoading: false });
    }
  },

  // 认领任务
  claimChore: async (id: string) => {
    try {
      const updatedChore = await choreApi.claimChore(id);
      const chores = get().chores.map((c) =>
        c.id === id ? updatedChore : c
      );
      set({ chores });
      // 重新加载统计数据
      await get().loadStats();
    } catch (error) {
      console.error('Failed to claim chore:', error);
      throw error;
    }
  },

  // 完成打卡
  completeChore: async (
    id: string,
    proofPhoto?: string,
    notes?: string
  ) => {
    try {
      const updatedChore = await choreApi.completeChore(id, proofPhoto, notes);
      const chores = get().chores.map((c) =>
        c.id === id ? updatedChore : c
      );
      set({ chores });
      // 重新加载统计数据
      await get().loadStats();
    } catch (error) {
      console.error('Failed to complete chore:', error);
      throw error;
    }
  },

  // 加载统计数据
  loadStats: async () => {
    try {
      const stats = await choreApi.getStats();
      set({
        userStats: stats.user,
        partnerStats: stats.partner,
        weekProgress: stats.weekProgress,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  // 加载排行榜
  loadLeaderboard: async () => {
    try {
      const leaderboard = await choreApi.getLeaderboard();
      set({ leaderboard });
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  },
}));
