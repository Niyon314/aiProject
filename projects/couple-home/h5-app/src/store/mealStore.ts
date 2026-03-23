import { create } from 'zustand';
import { mealApi, type MealVote, type VoteResult } from '../api/mealApi';

interface MealState {
  // 当前投票
  todayVote: MealVote | null;
  voteResult: VoteResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTodayVote: () => Promise<void>;
  createTodayVote: () => Promise<void>;
  submitVote: (optionId: string, type: 'like' | 'dislike' | 'veto') => Promise<void>;
  getVoteResult: () => Promise<void>;
  reset: () => void;
}

export const useMealStore = create<MealState>((set, get) => ({
  // Initial state
  todayVote: null,
  voteResult: null,
  isLoading: false,
  error: null,
  
  // Load today's vote
  loadTodayVote: async () => {
    set({ isLoading: true, error: null });
    try {
      const vote = await mealApi.getTodayVote();
      set({ todayVote: vote, isLoading: false });
    } catch (error) {
      // 如果 404，说明还没有创建投票
      if (error instanceof Error && error.message.includes('404')) {
        set({ todayVote: null, isLoading: false });
      } else {
        set({ error: '加载失败，请重试', isLoading: false });
      }
    }
  },
  
  // Create today's vote
  createTodayVote: async () => {
    set({ isLoading: true, error: null });
    try {
      const vote = await mealApi.createTodayVote();
      set({ todayVote: vote, isLoading: false });
    } catch (error) {
      set({ error: '创建投票失败，请重试', isLoading: false });
    }
  },
  
  // Submit vote
  submitVote: async (optionId: string, type: 'like' | 'dislike' | 'veto') => {
    const vote = get().todayVote;
    if (!vote) return;
    
    set({ isLoading: true, error: null });
    try {
      const updatedVote = await mealApi.submitVote(vote.id, { optionId, type });
      set({ todayVote: updatedVote, isLoading: false });
    } catch (error) {
      set({ error: '投票失败，请重试', isLoading: false });
    }
  },
  
  // Get vote result
  getVoteResult: async () => {
    const vote = get().todayVote;
    if (!vote) return;
    
    set({ isLoading: true, error: null });
    try {
      const result = await mealApi.getVoteResult(vote.id);
      set({ voteResult: result, isLoading: false });
    } catch (error) {
      set({ error: '获取结果失败，请重试', isLoading: false });
    }
  },
  
  // Reset state
  reset: () => {
    set({ todayVote: null, voteResult: null, error: null });
  },
}));
