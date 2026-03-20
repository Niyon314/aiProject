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

  // Clear all data (for testing)
  async clearAll() {
    const db = await this.init();
    await db.clear('votes');
    await db.clear('chores');
    await db.clear('bills');
    await db.clear('anniversaries');
  }
}

export const db = new Database();
