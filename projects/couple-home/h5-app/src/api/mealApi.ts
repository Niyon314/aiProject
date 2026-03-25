// 吃饭投票 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 投票数据类型
export interface MealOption {
  id: string;
  name: string;
  icon: string;
  cookTime: number;
  difficulty: string;
  cost: number;
  tags: string[];
}

export interface UserVote {
  optionId: string;
  type: 'like' | 'dislike' | 'veto';
  timestamp: string;
}

export interface MealVote {
  id: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  options: MealOption[];
  userVote?: UserVote;
  partnerVote?: UserVote;
  result?: MealOption;
  status: 'pending' | 'voted' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface VoteResult {
  vote: MealVote;
  match: boolean;
  matchedOptions: MealOption[];
  recommendation?: {
    name: string;
    price: number;
    deliveryTime?: number;
  };
}

// 吃饭投票 API
export const mealApi = {
  // 获取今日投票
  getTodayVote: async (): Promise<MealVote> => {
    const response = await fetch(`${API_BASE}/meals/today`);
    return handleResponse<MealVote>(response);
  },
  
  // 创建今日投票
  createTodayVote: async (): Promise<MealVote> => {
    const response = await fetch(`${API_BASE}/meals/today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<MealVote>(response);
  },
  
  // 提交投票
  submitVote: async (id: string, data: { optionId: string; type: 'like' | 'dislike' | 'veto' }): Promise<MealVote> => {
    const response = await fetch(`${API_BASE}/meals/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MealVote>(response);
  },
  
  // 获取投票结果
  getVoteResult: async (id: string): Promise<VoteResult> => {
    const response = await fetch(`${API_BASE}/meals/${id}/votes`);
    return handleResponse<VoteResult>(response);
  },
};
