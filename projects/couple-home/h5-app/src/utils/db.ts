import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'couple-home-db';
const DB_VERSION = 1;

export interface Vote {
  id: string;
  mealName: string;
  mealIcon: string;
  likes: number;
  dislikes: number;
  vetoes: number;
  userVote?: 'like' | 'dislike' | 'veto';
  deadline: string;
  status: 'pending' | 'completed';
  winner?: string;
}

export interface Chore {
  id: string;
  name: string;
  icon: string;
  assignee: 'user' | 'partner';
  dueDate: string;
  points: number;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  payer: 'user' | 'partner';
  date: string;
  category: string;
  photo?: string;
  status: 'pending' | 'confirmed' | 'disputed';
}

export interface UserSettings {
  nickname: string;
  partnerNickname: string;
  avatar: string;
  theme: 'pink' | 'blue' | 'purple';
  notifications: boolean;
}

export interface Anniversary {
  id: string;
  name: string;
  date: string;
  icon: string;
  daysTogether: number;
}

// 冰箱食材
export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'vegetable' | 'meat' | 'egg' | 'staple' | 'other';
  expiryDate: string;
  addedDate: string;
  status: 'fresh' | 'warning' | 'expired';
}

// 推荐偏好
export interface FoodPreference {
  id: string;
  mealName: string;
  disliked: boolean;
  createdAt: string;
}

// 共同基金
export interface Fund {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  deadline?: string;
}

// 人情记录
export interface Favor {
  id: string;
  title: string;
  amount: number;
  type: 'give' | 'receive';
  person: string;
  date: string;
  note?: string;
}

// 扩展 Bill 接口 (移除 AA 相关)
export interface BillExtended extends Bill {
  fundContribution?: boolean; // 是否计入共同基金
  favorId?: string; // 关联的人情记录
}

class Database {
  private db: IDBPDatabase | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Votes store
        if (!db.objectStoreNames.contains('votes')) {
          db.createObjectStore('votes', { keyPath: 'id' });
        }

        // Chores store
        if (!db.objectStoreNames.contains('chores')) {
          const choreStore = db.createObjectStore('chores', { keyPath: 'id' });
          choreStore.createIndex('status', 'status');
          choreStore.createIndex('assignee', 'assignee');
        }

        // Bills store
        if (!db.objectStoreNames.contains('bills')) {
          const billStore = db.createObjectStore('bills', { keyPath: 'id' });
          billStore.createIndex('status', 'status');
          billStore.createIndex('date', 'date');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Anniversaries store
        if (!db.objectStoreNames.contains('anniversaries')) {
          db.createObjectStore('anniversaries', { keyPath: 'id' });
        }

        // Fridge items store
        if (!db.objectStoreNames.contains('fridgeItems')) {
          const fridgeStore = db.createObjectStore('fridgeItems', { keyPath: 'id' });
          fridgeStore.createIndex('category', 'category');
          fridgeStore.createIndex('status', 'status');
          fridgeStore.createIndex('expiryDate', 'expiryDate');
        }

        // Food preferences store
        if (!db.objectStoreNames.contains('foodPreferences')) {
          db.createObjectStore('foodPreferences', { keyPath: 'id' });
        }

        // Funds store
        if (!db.objectStoreNames.contains('funds')) {
          db.createObjectStore('funds', { keyPath: 'id' });
        }

        // Favors store
        if (!db.objectStoreNames.contains('favors')) {
          const favorStore = db.createObjectStore('favors', { keyPath: 'id' });
          favorStore.createIndex('type', 'type');
          favorStore.createIndex('date', 'date');
        }
      },
    });

    return this.db;
  }

  // Votes CRUD
  async getVotes(): Promise<Vote[]> {
    const db = await this.init();
    return db.getAll('votes');
  }

  async addVote(vote: Vote) {
    const db = await this.init();
    await db.put('votes', vote);
  }

  async updateVote(id: string, updates: Partial<Vote>) {
    const db = await this.init();
    const vote = await db.get('votes', id);
    if (vote) {
      await db.put('votes', { ...vote, ...updates });
    }
  }

  async deleteVote(id: string) {
    const db = await this.init();
    await db.delete('votes', id);
  }

  // Chores CRUD
  async getChores(): Promise<Chore[]> {
    const db = await this.init();
    return db.getAll('chores');
  }

  async addChore(chore: Chore) {
    const db = await this.init();
    await db.put('chores', chore);
  }

  async updateChore(id: string, updates: Partial<Chore>) {
    const db = await this.init();
    const chore = await db.get('chores', id);
    if (chore) {
      await db.put('chores', { ...chore, ...updates });
    }
  }

  async deleteChore(id: string) {
    const db = await this.init();
    await db.delete('chores', id);
  }

  // Bills CRUD
  async getBills(): Promise<Bill[]> {
    const db = await this.init();
    return db.getAll('bills');
  }

  async addBill(bill: Bill) {
    const db = await this.init();
    await db.put('bills', bill);
  }

  async updateBill(id: string, updates: Partial<Bill>) {
    const db = await this.init();
    const bill = await db.get('bills', id);
    if (bill) {
      await db.put('bills', { ...bill, ...updates });
    }
  }

  async deleteBill(id: string) {
    const db = await this.init();
    await db.delete('bills', id);
  }

  // Settings CRUD
  async getSettings(): Promise<UserSettings> {
    const db = await this.init();
    const settings = await db.get('settings', 'user');
    return settings || {
      nickname: '小仙女',
      partnerNickname: '大笨蛋',
      avatar: '🧚‍♀️',
      theme: 'pink',
      notifications: true,
    };
  }

  async saveSettings(settings: UserSettings) {
    const db = await this.init();
    await db.put('settings', { key: 'user', ...settings });
  }

  // Anniversaries CRUD
  async getAnniversaries(): Promise<Anniversary[]> {
    const db = await this.init();
    return db.getAll('anniversaries');
  }

  async addAnniversary(anniversary: Anniversary) {
    const db = await this.init();
    await db.put('anniversaries', anniversary);
  }

  async updateAnniversary(id: string, updates: Partial<Anniversary>) {
    const db = await this.init();
    const anniversary = await db.get('anniversaries', id);
    if (anniversary) {
      await db.put('anniversaries', { ...anniversary, ...updates });
    }
  }

  // Fridge Items CRUD
  async getFridgeItems(): Promise<FridgeItem[]> {
    const db = await this.init();
    return db.getAll('fridgeItems');
  }

  async addFridgeItem(item: FridgeItem) {
    const db = await this.init();
    await db.put('fridgeItems', item);
  }

  async updateFridgeItem(id: string, updates: Partial<FridgeItem>) {
    const db = await this.init();
    const item = await db.get('fridgeItems', id);
    if (item) {
      await db.put('fridgeItems', { ...item, ...updates });
    }
  }

  async deleteFridgeItem(id: string) {
    const db = await this.init();
    await db.delete('fridgeItems', id);
  }

  // Food Preferences CRUD
  async getFoodPreferences(): Promise<FoodPreference[]> {
    const db = await this.init();
    return db.getAll('foodPreferences');
  }

  async addFoodPreference(preference: FoodPreference) {
    const db = await this.init();
    await db.put('foodPreferences', preference);
  }

  async deleteFoodPreference(id: string) {
    const db = await this.init();
    await db.delete('foodPreferences', id);
  }

  // Funds CRUD
  async getFunds(): Promise<Fund[]> {
    const db = await this.init();
    return db.getAll('funds');
  }

  async addFund(fund: Fund) {
    const db = await this.init();
    await db.put('funds', fund);
  }

  async updateFund(id: string, updates: Partial<Fund>) {
    const db = await this.init();
    const fund = await db.get('funds', id);
    if (fund) {
      await db.put('funds', { ...fund, ...updates });
    }
  }

  async deleteFund(id: string) {
    const db = await this.init();
    await db.delete('funds', id);
  }

  // Favors CRUD
  async getFavors(): Promise<Favor[]> {
    const db = await this.init();
    return db.getAll('favors');
  }

  async addFavor(favor: Favor) {
    const db = await this.init();
    await db.put('favors', favor);
  }

  async updateFavor(id: string, updates: Partial<Favor>) {
    const db = await this.init();
    const favor = await db.get('favors', id);
    if (favor) {
      await db.put('favors', { ...favor, ...updates });
    }
  }

  async deleteFavor(id: string) {
    const db = await this.init();
    await db.delete('favors', id);
  }

  // Clear all data (for testing)
  async clearAll() {
    const db = await this.init();
    await db.clear('votes');
    await db.clear('chores');
    await db.clear('bills');
    await db.clear('anniversaries');
    await db.clear('fridgeItems');
    await db.clear('foodPreferences');
    await db.clear('funds');
    await db.clear('favors');
  }
}

export const db = new Database();
