import { create } from 'zustand';
import { diaryApi, type Diary, type CreateDiaryRequest, type UpdateDiaryRequest } from '../api/diaryApi';

interface DiaryState {
  diaries: Diary[];
  loading: boolean;
  error: string | null;

  // Actions
  loadDiaries: (params?: { month?: string; page?: number; pageSize?: number }) => Promise<void>;
  addDiary: (data: CreateDiaryRequest) => Promise<Diary>;
  updateDiary: (id: string, updates: UpdateDiaryRequest) => Promise<Diary>;
  deleteDiary: (id: string) => Promise<void>;
  uploadPhotos: (id: string, photoUrls: string[]) => Promise<Diary>;
  updatePrivacy: (id: string, privacy: 'private' | 'shared') => Promise<Diary>;
}

export const useDiaryStore = create<DiaryState>((set, _get) => ({
  diaries: [],
  loading: false,
  error: null,

  loadDiaries: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await diaryApi.getAll(params);
      set({ diaries: response.diaries, loading: false });
    } catch (error) {
      set({ error: '加载日记失败', loading: false });
      console.error('Failed to load diaries:', error);
    }
  },

  addDiary: async (data) => {
    try {
      const diary = await diaryApi.create(data);
      set((state) => ({
        diaries: [diary, ...state.diaries],
      }));
      return diary;
    } catch (error) {
      console.error('Failed to create diary:', error);
      throw error;
    }
  },

  updateDiary: async (id, updates) => {
    try {
      const diary = await diaryApi.update(id, updates);
      set((state) => ({
        diaries: state.diaries.map((d) => (d.id === id ? diary : d)),
      }));
      return diary;
    } catch (error) {
      console.error('Failed to update diary:', error);
      throw error;
    }
  },

  deleteDiary: async (id) => {
    try {
      await diaryApi.delete(id);
      set((state) => ({
        diaries: state.diaries.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete diary:', error);
      throw error;
    }
  },

  uploadPhotos: async (id, photoUrls) => {
    try {
      const diary = await diaryApi.uploadPhotos(id, photoUrls);
      set((state) => ({
        diaries: state.diaries.map((d) => (d.id === id ? diary : d)),
      }));
      return diary;
    } catch (error) {
      console.error('Failed to upload photos:', error);
      throw error;
    }
  },

  updatePrivacy: async (id, privacy) => {
    try {
      const diary = await diaryApi.updatePrivacy(id, privacy);
      set((state) => ({
        diaries: state.diaries.map((d) => (d.id === id ? diary : d)),
      }));
      return diary;
    } catch (error) {
      console.error('Failed to update privacy:', error);
      throw error;
    }
  },
}));
