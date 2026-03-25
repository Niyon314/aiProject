import { create } from 'zustand';
import { billApi, fundApi } from '../api/client';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  payer: string;
  date: string;
  category: string;
  note?: string;
  status?: string;
  createdAt?: string;
}

export interface Fund {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyGoal?: number;
  icon?: string;
  deadline?: string;
}

export interface Favor {
  id: string;
  title: string;
  amount: number;
  type: 'give' | 'receive';
  person: string;
  date: string;
  note?: string;
}

interface BillState {
  bills: Bill[];
  stats: any;
  funds: Fund[];
  favors: Favor[];
  loading: boolean;
  error: string | null;

  loadBills: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadFunds: () => Promise<void>;
  loadFavors: () => Promise<void>;
  addBill: (bill: Partial<Bill>) => Promise<void>;
  confirmBill: (id: string) => Promise<void>;
  addFund: (fund: Partial<Fund>) => Promise<void>;
  updateFund: (id: string, updates: Partial<Fund>) => Promise<void>;
  addFavor: (favor: Partial<Favor>) => Promise<void>;
  contributeToFund: (fundId: string, amount: number) => Promise<void>;
  settings: { nickname: string; partnerNickname: string };
}

export const useBillStore = create<BillState>((set) => ({
  bills: [],
  stats: null,
  funds: [],
  favors: [],
  loading: false,
  error: null,
  settings: { nickname: '我', partnerNickname: 'TA' },

  loadBills: async () => {
    set({ loading: true, error: null });
    try {
      const bills = await billApi.getAll() as Bill[];
      set({ bills: Array.isArray(bills) ? bills : [], loading: false });
    } catch {
      set({ error: '加载账单失败', loading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await billApi.getStats() as any;
      set({ stats });
    } catch {
      // silent
    }
  },

  loadFunds: async () => {
    try {
      const funds = await fundApi.getAll() as Fund[];
      set({ funds: Array.isArray(funds) ? funds : [] });
    } catch {
      // silent
    }
  },

  addBill: async (bill) => {
    set({ loading: true, error: null });
    try {
      const newBill = await billApi.create({
        title: bill.title || '',
        amount: bill.amount || 0,
        payer: bill.payer || 'user',
        category: bill.category || 'other',
        date: bill.date || new Date().toISOString(),
        note: bill.note,
      });
      set(state => ({ bills: [newBill as Bill, ...state.bills], loading: false }));
    } catch {
      set({ error: '添加失败', loading: false });
    }
  },

  contributeToFund: async (fundId, amount) => {
    try {
      await fundApi.contribute(fundId, amount, 'user');
      const funds = await fundApi.getAll() as Fund[];
      set({ funds: Array.isArray(funds) ? funds : [] });
    } catch {
      set({ error: '充值失败' });
    }
  },

  confirmBill: async (id) => {
    try {
      set(state => ({
        bills: state.bills.map(b => b.id === id ? { ...b, status: 'confirmed' } : b),
      }));
    } catch {
      set({ error: '确认失败' });
    }
  },

  addFund: async (fund) => {
    set(state => ({
      funds: [{ id: Date.now().toString(), name: fund.name || '', targetAmount: fund.targetAmount || 0, currentAmount: 0, ...fund } as Fund, ...state.funds],
    }));
  },

  updateFund: async (id, updates) => {
    set(state => ({
      funds: state.funds.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  },

  loadFavors: async () => {
    // 人情记录暂用本地状态
    set({ favors: [] });
  },

  addFavor: async (favor) => {
    set(state => ({
      favors: [{ id: Date.now().toString(), title: '', amount: 0, type: 'give', person: '', date: new Date().toISOString(), ...favor } as Favor, ...state.favors],
    }));
  },
}));
