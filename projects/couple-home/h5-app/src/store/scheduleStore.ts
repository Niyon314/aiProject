import { create } from 'zustand';
import { scheduleApi, type Schedule } from '../api/scheduleApi';

interface ScheduleState {
  // 状态
  schedules: Schedule[];
  upcomingSchedules: Schedule[];
  isLoading: boolean;

  // Actions
  loadSchedules: () => Promise<void>;
  loadUpcoming: () => Promise<void>;
  createSchedule: (data: {
    title: string;
    description?: string;
    icon: string;
    startTime: string;
    endTime: string;
    location?: string;
    type: 'date' | 'work' | 'family' | 'friend' | 'other';
    reminder: 'none' | '1h' | '1d' | '1w';
    participants: ('user' | 'partner')[];
  }) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  // 初始状态
  schedules: [],
  upcomingSchedules: [],
  isLoading: false,

  // 加载日程列表
  loadSchedules: async () => {
    set({ isLoading: true });
    try {
      const schedules = await scheduleApi.getAll();
      set({ schedules, isLoading: false });
    } catch (error) {
      console.error('Failed to load schedules:', error);
      set({ isLoading: false });
    }
  },

  // 加载即将开始的日程
  loadUpcoming: async () => {
    try {
      const upcomingSchedules = await scheduleApi.getUpcoming();
      set({ upcomingSchedules });
    } catch (error) {
      console.error('Failed to load upcoming schedules:', error);
    }
  },

  // 创建日程
  createSchedule: async (data) => {
    try {
      await scheduleApi.create(data);
      await get().loadSchedules();
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  },

  // 更新日程
  updateSchedule: async (id, updates) => {
    try {
      await scheduleApi.update(id, updates);
      await get().loadSchedules();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error;
    }
  },

  // 删除日程
  deleteSchedule: async (id) => {
    try {
      await scheduleApi.delete(id);
      await get().loadSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw error;
    }
  },
}));
