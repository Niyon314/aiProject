import { create } from 'zustand';
import { db, type Vote, type Chore, type Bill, type UserSettings, type Anniversary, type FridgeItem, type FoodPreference, type Fund, type Favor } from '../utils/db';

interface AppState {
  // Settings
  settings: UserSettings | null;
  isLoading: boolean;
  
  // Data
  votes: Vote[];
  chores: Chore[];
  bills: Bill[];
  anniversaries: Anniversary[];
  fridgeItems: FridgeItem[];
  foodPreferences: FoodPreference[];
  funds: Fund[];
  favors: Favor[];
  
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
  loadFoodPreferences: () => Promise<void>;
  
  loadFridgeItems: () => Promise<void>;
  addFridgeItem: (item: FridgeItem) => Promise<void>;
  updateFridgeItem: (id: string, updates: Partial<FridgeItem>) => Promise<void>;
  deleteFridgeItem: (id: string) => Promise<void>;
  
  addFoodPreference: (preference: FoodPreference) => Promise<void>;
  getDislikedMeals: () => string[];
  
  loadFunds: () => Promise<void>;
  addFund: (fund: Fund) => Promise<void>;
  updateFund: (id: string, updates: Partial<Fund>) => Promise<void>;
  contributeToFund: (id: string, amount: number) => Promise<void>;
  
  loadFavors: () => Promise<void>;
  addFavor: (favor: Favor) => Promise<void>;
  updateFavor: (id: string, updates: Partial<Favor>) => Promise<void>;
  
  // Helper
  calculateDaysTogether: (startDate: string) => number;
  checkExpiryStatus: (expiryDate: string) => 'fresh' | 'warning' | 'expired';
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  settings: null,
  isLoading: true,
  votes: [],
  chores: [],
  bills: [],
  anniversaries: [],
  fridgeItems: [],
  foodPreferences: [],
  funds: [],
  favors: [],
  
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
  
  loadFoodPreferences: async () => {
    const foodPreferences = await db.getFoodPreferences();
    set({ foodPreferences });
  },
  
  // Helper
  calculateDaysTogether: (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
  
  // Fridge Items actions
  loadFridgeItems: async () => {
    const fridgeItems = await db.getFridgeItems();
    set({ fridgeItems });
  },
  
  addFridgeItem: async (item) => {
    await db.addFridgeItem(item);
    await get().loadFridgeItems();
  },
  
  updateFridgeItem: async (id, updates) => {
    await db.updateFridgeItem(id, updates);
    await get().loadFridgeItems();
  },
  
  deleteFridgeItem: async (id) => {
    await db.deleteFridgeItem(id);
    await get().loadFridgeItems();
  },
  
  // Food Preferences actions
  addFoodPreference: async (preference) => {
    await db.addFoodPreference(preference);
    await get().loadFoodPreferences();
  },
  
  getDislikedMeals: () => {
    return get().foodPreferences
      .filter(p => p.disliked)
      .map(p => p.mealName);
  },
  
  // Funds actions
  loadFunds: async () => {
    const funds = await db.getFunds();
    set({ funds });
  },
  
  addFund: async (fund) => {
    await db.addFund(fund);
    await get().loadFunds();
  },
  
  updateFund: async (id, updates) => {
    await db.updateFund(id, updates);
    await get().loadFunds();
  },
  
  contributeToFund: async (id, amount) => {
    const funds = get().funds;
    const fund = funds.find(f => f.id === id);
    if (fund) {
      await db.updateFund(id, { currentAmount: fund.currentAmount + amount });
      await get().loadFunds();
    }
  },
  
  // Favors actions
  loadFavors: async () => {
    const favors = await db.getFavors();
    set({ favors });
  },
  
  addFavor: async (favor) => {
    await db.addFavor(favor);
    await get().loadFavors();
  },
  
  updateFavor: async (id, updates) => {
    await db.updateFavor(id, updates);
    await get().loadFavors();
  },
  
  // Expiry status checker
  checkExpiryStatus: (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'fresh';
  },
}));
