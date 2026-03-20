import { create } from 'zustand';
import { db, type Vote, type Chore, type Bill, type UserSettings, type Anniversary } from '../utils/db';

interface AppState {
  // Settings
  settings: UserSettings | null;
  isLoading: boolean;
  
  // Data
  votes: Vote[];
  chores: Chore[];
  bills: Bill[];
  anniversaries: Anniversary[];
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  loadVotes: () => Promise<void>;
  addVote: (vote: Vote) => Promise<void>;
  updateVote: (id: string, updates: Partial<Vote>) => Promise<void>;
  voteOnMeal: (id: string, type: 'like' | 'dislike' | 'veto') => Promise<void>;
  
  loadChores: () => Promise<void>;
  addChore: (chore: Chore) => Promise<void>;
  completeChore: (id: string) => Promise<void>;
  
  loadBills: () => Promise<void>;
  addBill: (bill: Bill) => Promise<void>;
  confirmBill: (id: string) => Promise<void>;
  
  loadAnniversaries: () => Promise<void>;
  
  // Helper
  calculateDaysTogether: (startDate: string) => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  settings: null,
  isLoading: true,
  votes: [],
  chores: [],
  bills: [],
  anniversaries: [],
  
  // Settings actions
  loadSettings: async () => {
    const settings = await db.getSettings();
    set({ settings, isLoading: false });
  },
  
  updateSettings: async (updates) => {
    const current = get().settings;
    if (!current) return;
    
    const newSettings = { ...current, ...updates };
    await db.saveSettings(newSettings);
    set({ settings: newSettings });
  },
  
  // Votes actions
  loadVotes: async () => {
    const votes = await db.getVotes();
    set({ votes });
  },
  
  addVote: async (vote) => {
    await db.addVote(vote);
    await get().loadVotes();
  },
  
  updateVote: async (id, updates) => {
    await db.updateVote(id, updates);
    await get().loadVotes();
  },
  
  voteOnMeal: async (id, type) => {
    const votes = get().votes;
    const vote = votes.find(v => v.id === id);
    if (!vote) return;
    
    // Remove previous vote if exists
    if (vote.userVote === 'like') vote.likes--;
    if (vote.userVote === 'dislike') vote.dislikes--;
    if (vote.userVote === 'veto') vote.vetoes--;
    
    // Add new vote
    if (type === 'like') vote.likes++;
    if (type === 'dislike') vote.dislikes++;
    if (type === 'veto') vote.vetoes++;
    
    vote.userVote = type;
    
    await db.updateVote(id, vote);
    await get().loadVotes();
  },
  
  // Chores actions
  loadChores: async () => {
    const chores = await db.getChores();
    set({ chores });
  },
  
  addChore: async (chore) => {
    await db.addChore(chore);
    await get().loadChores();
  },
  
  completeChore: async (id) => {
    await db.updateChore(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    await get().loadChores();
  },
  
  // Bills actions
  loadBills: async () => {
    const bills = await db.getBills();
    set({ bills });
  },
  
  addBill: async (bill) => {
    await db.addBill(bill);
    await get().loadBills();
  },
  
  confirmBill: async (id) => {
    await db.updateBill(id, { status: 'confirmed' });
    await get().loadBills();
  },
  
  // Anniversaries actions
  loadAnniversaries: async () => {
    const anniversaries = await db.getAnniversaries();
    set({ anniversaries });
  },
  
  // Helper
  calculateDaysTogether: (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
}));
