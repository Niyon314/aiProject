// 日程管理 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  icon: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'date' | 'work' | 'family' | 'friend' | 'other';
  reminder: 'none' | '1h' | '1d' | '1w';
  participants: ('user' | 'partner')[];
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const scheduleApi = {
  // 获取日程列表
  getAll: async (): Promise<Schedule[]> => {
    const response = await fetch(`${API_BASE}/schedules`);
    return handleResponse<Schedule[]>(response);
  },

  // 获取即将开始的日程
  getUpcoming: async (): Promise<Schedule[]> => {
    const response = await fetch(`${API_BASE}/schedules/upcoming`);
    return handleResponse<Schedule[]>(response);
  },

  // 创建日程
  create: async (data: {
    title: string;
    description?: string;
    icon: string;
    startTime: string;
    endTime: string;
    location?: string;
    type: 'date' | 'work' | 'family' | 'friend' | 'other';
    reminder: 'none' | '1h' | '1d' | '1w';
    participants: ('user' | 'partner')[];
  }): Promise<Schedule> => {
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Schedule>(response);
  },

  // 更新日程
  update: async (id: string, updates: Partial<Schedule>): Promise<Schedule> => {
    const response = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Schedule>(response);
  },

  // 删除日程
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
