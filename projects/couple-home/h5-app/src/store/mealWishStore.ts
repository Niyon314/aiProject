import { create } from 'zustand';
import { mealWishApi, type MealWish, type MealHistory, type MealRecommendation } from '../api/mealWishApi';

interface MealWishState {
  wishes: MealWish[];
  history: MealHistory[];
  recommendation: MealRecommendation | null;
  isLoading: boolean;
  error: string | null;

  loadWishes: (status?: string) => Promise<void>;
  addWish: (data: Partial<MealWish>) => Promise<void>;
  updateWish: (id: string, data: Partial<MealWish>) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  markDone: (id: string, rating?: number, comment?: string) => Promise<void>;
  getRecommendation: (category?: string) => Promise<void>;
  loadHistory: (limit?: number) => Promise<void>;
  addHistory: (data: Partial<MealHistory>) => Promise<void>;
}

export const useMealWishStore = create<MealWishState>((set) => ({
  wishes: [],
  history: [],
  recommendation: null,
  isLoading: false,
  error: null,

  loadWishes: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const wishes = await mealWishApi.getWishes(status);
      set({ wishes, isLoading: false });
    } catch {
      set({ error: '加载想吃清单失败', isLoading: false });
    }
  },

  addWish: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const wish = await mealWishApi.addWish(data);
      set(state => ({ wishes: [wish, ...state.wishes], isLoading: false }));
    } catch {
      set({ error: '添加失败，请重试', isLoading: false });
    }
  },

  updateWish: async (id, data) => {
    try {
      const updated = await mealWishApi.updateWish(id, data);
      set(state => ({
        wishes: state.wishes.map(w => w.id === id ? updated : w),
      }));
    } catch {
      set({ error: '更新失败' });
    }
  },

  deleteWish: async (id) => {
    try {
      await mealWishApi.deleteWish(id);
      set(state => ({
        wishes: state.wishes.filter(w => w.id !== id),
      }));
    } catch {
      set({ error: '删除失败' });
    }
  },

  markDone: async (id, rating, comment) => {
    try {
      const updated = await mealWishApi.markDone(id, rating, comment);
      set(state => ({
        wishes: state.wishes.map(w => w.id === id ? updated : w),
      }));
    } catch {
      set({ error: '操作失败' });
    }
  },

  getRecommendation: async (category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const recommendation = await mealWishApi.getRecommendation(category);
      set({ recommendation, isLoading: false });
    } catch {
      set({ error: '获取推荐失败', isLoading: false });
    }
  },

  loadHistory: async (limit?: number) => {
    try {
      const history = await mealWishApi.getHistory(limit);
      set({ history });
    } catch {
      set({ error: '加载历史失败' });
    }
  },

  addHistory: async (data) => {
    try {
      const item = await mealWishApi.addHistory(data);
      set(state => ({ history: [item, ...state.history] }));
    } catch {
      set({ error: '记录失败' });
    }
  },
}));
