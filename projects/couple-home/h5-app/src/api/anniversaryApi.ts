// 纪念日 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Anniversary {
  id: string;
  name: string;
  date: string;
  icon: string;
  type: 'festival' | 'birthday' | 'relationship' | 'other';
  year: number;
  isLunar: boolean;
  reminderDays: number[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DaysTogetherResponse {
  totalDays: number;
  startDate: string;
  milestone?: {
    next: number;
    daysUntil: number;
  };
}

export const anniversaryApi = {
  // 获取纪念日列表
  getAll: async (): Promise<Anniversary[]> => {
    const response = await fetch(`${API_BASE}/anniversaries`);
    return handleResponse<Anniversary[]>(response);
  },

  // 获取即将到来的纪念日
  getUpcoming: async (): Promise<Anniversary[]> => {
    const response = await fetch(`${API_BASE}/anniversaries/upcoming`);
    return handleResponse<Anniversary[]>(response);
  },

  // 获取在一起天数
  getDaysTogether: async (): Promise<DaysTogetherResponse> => {
    const response = await fetch(`${API_BASE}/anniversaries/days`);
    return handleResponse<DaysTogetherResponse>(response);
  },

  // 创建纪念日
  create: async (data: {
    name: string;
    date: string;
    icon: string;
    type: 'festival' | 'birthday' | 'relationship' | 'other';
    year: number;
    isLunar: boolean;
    reminderDays: number[];
    notes?: string;
  }): Promise<Anniversary> => {
    const response = await fetch(`${API_BASE}/anniversaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Anniversary>(response);
  },

  // 更新纪念日
  update: async (id: string, updates: Partial<Anniversary>): Promise<Anniversary> => {
    const response = await fetch(`${API_BASE}/anniversaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Anniversary>(response);
  },

  // 删除纪念日
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/anniversaries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
