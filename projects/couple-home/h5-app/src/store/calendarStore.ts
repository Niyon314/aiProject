import { create } from 'zustand';
import { calendarApi, type CalendarEvent, type CreateEventRequest, type UpdateEventRequest } from '../api/calendarApi';

interface CalendarState {
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  loading: boolean;
  error: string | null;

  // Actions
  loadEvents: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  loadUpcoming: () => Promise<void>;
  addEvent: (data: CreateEventRequest) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: UpdateEventRequest) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  confirmEvent: (id: string, confirmedBy: 'user' | 'partner' | 'both') => Promise<CalendarEvent>;
  markEventCompleted: (id: string) => Promise<CalendarEvent>;
  markEventCancelled: (id: string) => Promise<CalendarEvent>;
}

export const useCalendarStore = create<CalendarState>((set, _get) => ({
  events: [],
  upcomingEvents: [],
  loading: false,
  error: null,

  loadEvents: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await calendarApi.getAll(params);
      set({ events: response.events, loading: false });
    } catch (error) {
      set({ error: '加载日程失败', loading: false });
      console.error('Failed to load events:', error);
    }
  },

  loadUpcoming: async () => {
    try {
      const events = await calendarApi.getUpcoming();
      set({ upcomingEvents: events });
    } catch (error) {
      console.error('Failed to load upcoming events:', error);
    }
  },

  addEvent: async (data) => {
    try {
      const event = await calendarApi.create(data);
      set((state) => ({
        events: [event, ...state.events],
      }));
      return event;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const event = await calendarApi.update(id, updates);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
        upcomingEvents: state.upcomingEvents.map((e) => (e.id === id ? event : e)),
      }));
      return event;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await calendarApi.delete(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        upcomingEvents: state.upcomingEvents.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  },

  confirmEvent: async (id, confirmedBy) => {
    try {
      const event = await calendarApi.confirm(id, confirmedBy);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
      }));
      return event;
    } catch (error) {
      console.error('Failed to confirm event:', error);
      throw error;
    }
  },

  markEventCompleted: async (id) => {
    try {
      const event = await calendarApi.markCompleted(id);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
      }));
      return event;
    } catch (error) {
      console.error('Failed to mark event completed:', error);
      throw error;
    }
  },

  markEventCancelled: async (id) => {
    try {
      const event = await calendarApi.markCancelled(id);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
      }));
      return event;
    } catch (error) {
      console.error('Failed to mark event cancelled:', error);
      throw error;
    }
  },
}));
