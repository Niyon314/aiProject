import { create } from 'zustand';
import { reminderApi, type Reminder, type CreateReminderRequest, type UpdateReminderRequest } from '../api/reminderApi';

interface ReminderState {
  reminders: Reminder[];
  upcomingReminders: Reminder[];
  loading: boolean;
  error: string | null;

  // Actions
  loadReminders: (params?: { type?: string; status?: string; month?: string }) => Promise<void>;
  loadUpcoming: () => Promise<void>;
  addReminder: (data: CreateReminderRequest) => Promise<Reminder>;
  updateReminder: (id: string, updates: UpdateReminderRequest) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  markReminderCompleted: (id: string) => Promise<Reminder>;
  markReminderCancelled: (id: string) => Promise<Reminder>;
  getGiftIdeas: (type?: string, budget?: string) => Promise<any>;
  getDateIdeas: (type?: string, budget?: string) => Promise<any>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  upcomingReminders: [],
  loading: false,
  error: null,

  loadReminders: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await reminderApi.getAll(params);
      set({ reminders: response.reminders, loading: false });
    } catch (error) {
      set({ error: '加载提醒失败', loading: false });
      console.error('Failed to load reminders:', error);
    }
  },

  loadUpcoming: async () => {
    try {
      const reminders = await reminderApi.getUpcoming();
      set({ upcomingReminders: reminders });
    } catch (error) {
      console.error('Failed to load upcoming reminders:', error);
    }
  },

  addReminder: async (data) => {
    try {
      const reminder = await reminderApi.create(data);
      set((state) => ({
        reminders: [...state.reminders, reminder],
      }));
      return reminder;
    } catch (error) {
      console.error('Failed to create reminder:', error);
      throw error;
    }
  },

  updateReminder: async (id, updates) => {
    try {
      const reminder = await reminderApi.update(id, updates);
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
        upcomingReminders: state.upcomingReminders.map((r) => (r.id === id ? reminder : r)),
      }));
      return reminder;
    } catch (error) {
      console.error('Failed to update reminder:', error);
      throw error;
    }
  },

  deleteReminder: async (id) => {
    try {
      await reminderApi.delete(id);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        upcomingReminders: state.upcomingReminders.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      throw error;
    }
  },

  markReminderCompleted: async (id) => {
    try {
      const reminder = await reminderApi.markCompleted(id);
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
      }));
      return reminder;
    } catch (error) {
      console.error('Failed to mark reminder completed:', error);
      throw error;
    }
  },

  markReminderCancelled: async (id) => {
    try {
      const reminder = await reminderApi.markCancelled(id);
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
      }));
      return reminder;
    } catch (error) {
      console.error('Failed to mark reminder cancelled:', error);
      throw error;
    }
  },

  getGiftIdeas: async (type, budget) => {
    try {
      return await reminderApi.getGiftIdeas(type, budget);
    } catch (error) {
      console.error('Failed to get gift ideas:', error);
      throw error;
    }
  },

  getDateIdeas: async (type, budget) => {
    try {
      return await reminderApi.getDateIdeas(type, budget);
    } catch (error) {
      console.error('Failed to get date ideas:', error);
      throw error;
    }
  },
}));
