// 家务分工 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Chore {
  id: string;
  name: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'once';
  points: number;
  assignee?: 'user' | 'partner';
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
  proofPhoto?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  completedTasks: number;
  onTimeRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  completedTasks: number;
  rank: number;
}

export const choreApi = {
  // 获取任务列表
  getChores: async (): Promise<Chore[]> => {
    const response = await fetch(`${API_BASE}/chores`);
    return handleResponse<Chore[]>(response);
  },

  // 创建任务
  createChore: async (data: {
    name: string;
    icon: string;
    type: 'daily' | 'weekly' | 'monthly' | 'once';
    points: number;
    dueDate: string;
  }): Promise<Chore> => {
    const response = await fetch(`${API_BASE}/chores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Chore>(response);
  },

  // 认领任务
  claimChore: async (id: string): Promise<Chore> => {
    const response = await fetch(`${API_BASE}/chores/${id}/claim`, {
      method: 'POST',
    });
    return handleResponse<Chore>(response);
  },

  // 完成打卡
  completeChore: async (
    id: string,
    proofPhoto?: string,
    notes?: string
  ): Promise<Chore> => {
    const response = await fetch(`${API_BASE}/chores/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofPhoto, notes }),
    });
    return handleResponse<Chore>(response);
  },

  // 获取统计数据
  getStats: async (): Promise<{
    user: UserStats;
    partner: UserStats;
    weekProgress: { completed: number; total: number };
  }> => {
    const response = await fetch(`${API_BASE}/chores/stats`);
    return handleResponse(response);
  },

  // 获取排行榜
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_BASE}/chores/leaderboard`);
    return handleResponse<LeaderboardEntry[]>(response);
  },
};
