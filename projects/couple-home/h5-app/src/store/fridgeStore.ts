import { create } from 'zustand';
import { fridgeApi } from '../api/client';

export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  addedDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FridgeState {
  items: FridgeItem[];
  expiringItems: FridgeItem[];
  loading: boolean;
  error: string | null;

  loadItems: () => Promise<void>;
  loadExpiring: () => Promise<void>;
  addItem: (item: Partial<FridgeItem>) => Promise<void>;
  updateItem: (id: string, updates: Partial<FridgeItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  checkExpiryStatus: (expiryDate: string) => 'fresh' | 'warning' | 'expired';
}

export const useFridgeStore = create<FridgeState>((set) => ({
  items: [],
  expiringItems: [],
  loading: false,
  error: null,

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fridgeApi.getAll() as FridgeItem[];
      set({ items, loading: false });
    } catch {
      set({ error: '加载冰箱失败', loading: false });
    }
  },

  loadExpiring: async () => {
    try {
      const expiringItems = await fridgeApi.getExpiring() as FridgeItem[];
      set({ expiringItems });
    } catch {
      // silent
    }
  },

  addItem: async (item) => {
    set({ loading: true, error: null });
    try {
      const newItem = await fridgeApi.add(item as any) as FridgeItem;
      set(state => ({ items: [newItem, ...state.items], loading: false }));
    } catch {
      set({ error: '添加失败', loading: false });
    }
  },

  updateItem: async (id, updates) => {
    try {
      const updated = await fridgeApi.update(id, updates) as FridgeItem;
      set(state => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updated } : i),
      }));
    } catch {
      set({ error: '更新失败' });
    }
  },

  deleteItem: async (id) => {
    try {
      await fridgeApi.delete(id);
      set(state => ({
        items: state.items.filter(i => i.id !== id),
      }));
    } catch {
      set({ error: '删除失败' });
    }
  },

  checkExpiryStatus: (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= 3) return 'warning';
    return 'fresh';
  },
}));
