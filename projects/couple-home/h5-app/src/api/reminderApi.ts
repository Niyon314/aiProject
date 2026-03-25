// 惊喜提醒 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  notes?: string;
  reminderDays: number[];
  giftIdeas: string[];
  dateIdeas: string[];
  partnerId?: string;
  partnerName?: string;
  isRecurring: boolean;
  lastNotified?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  notes?: string;
  reminderDays?: number[];
  giftIdeas?: string[];
  dateIdeas?: string[];
  partnerName?: string;
  isRecurring?: boolean;
}

export interface UpdateReminderRequest {
  title?: string;
  date?: string;
  type?: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  notes?: string;
  reminderDays?: number[];
  giftIdeas?: string[];
  dateIdeas?: string[];
  partnerName?: string;
  isRecurring?: boolean;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface ReminderListResponse {
  reminders: Reminder[];
  total: number;
}

export interface GiftIdeaResponse {
  category: string;
  ideas: string[];
  budget: string;
  reason: string;
}

export interface DateIdeaResponse {
  category: string;
  ideas: string[];
  budget: string;
  duration: string;
  preparation: string;
}

export const reminderApi = {
  // 获取提醒列表
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    month?: string;
  }): Promise<ReminderListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.month) queryParams.append('month', params.month);

    const response = await fetch(`${API_BASE}/reminders?${queryParams.toString()}`);
    return handleResponse<ReminderListResponse>(response);
  },

  // 获取单个提醒
  getById: async (id: string): Promise<Reminder> => {
    const response = await fetch(`${API_BASE}/reminders/${id}`);
    return handleResponse<Reminder>(response);
  },

  // 获取即将到期的提醒
  getUpcoming: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE}/reminders/upcoming`);
    return handleResponse<Reminder[]>(response);
  },

  // 获取礼物推荐
  getGiftIdeas: async (type?: string, budget?: string): Promise<GiftIdeaResponse> => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (budget) queryParams.append('budget', budget);

    const response = await fetch(`${API_BASE}/reminders/gift-ideas?${queryParams.toString()}`);
    return handleResponse<GiftIdeaResponse>(response);
  },

  // 获取约会建议
  getDateIdeas: async (type?: string, budget?: string): Promise<DateIdeaResponse> => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (budget) queryParams.append('budget', budget);

    const response = await fetch(`${API_BASE}/reminders/date-ideas?${queryParams.toString()}`);
    return handleResponse<DateIdeaResponse>(response);
  },

  // 创建提醒
  create: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Reminder>(response);
  },

  // 更新提醒
  update: async (id: string, updates: UpdateReminderRequest): Promise<Reminder> => {
    const response = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Reminder>(response);
  },

  // 删除提醒
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // 标记为已完成
  markCompleted: async (id: string): Promise<Reminder> => {
    return reminderApi.update(id, { status: 'completed' });
  },

  // 标记为已取消
  markCancelled: async (id: string): Promise<Reminder> => {
    return reminderApi.update(id, { status: 'cancelled' });
  },
};
