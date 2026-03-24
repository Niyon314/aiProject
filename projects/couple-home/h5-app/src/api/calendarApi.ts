// 共享日历 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'date' | 'work' | 'family' | 'friend' | 'other';
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  status: 'planned' | 'completed' | 'cancelled';
  confirmedBy: 'none' | 'user' | 'partner' | 'both';
  icon: string;
  reminder: 'none' | '1h' | '1d' | '1w';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  type: 'date' | 'work' | 'family' | 'friend' | 'other';
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  icon?: string;
  reminder?: 'none' | '1h' | '1d' | '1w';
}

export interface UpdateEventRequest {
  title?: string;
  type?: 'date' | 'work' | 'family' | 'friend' | 'other';
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  icon?: string;
  reminder?: 'none' | '1h' | '1d' | '1w';
  status?: 'planned' | 'completed' | 'cancelled';
  confirmedBy?: 'none' | 'user' | 'partner' | 'both';
}

export interface EventListResponse {
  events: CalendarEvent[];
  total: number;
}

export const calendarApi = {
  // 获取日程列表
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
  }): Promise<EventListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_BASE}/calendar/events?${queryParams.toString()}`);
    return handleResponse<EventListResponse>(response);
  },

  // 获取单个日程
  getById: async (id: string): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE}/calendar/events/${id}`);
    return handleResponse<CalendarEvent>(response);
  },

  // 获取即将开始的日程
  getUpcoming: async (): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE}/calendar/events/upcoming`);
    return handleResponse<CalendarEvent[]>(response);
  },

  // 获取指定日期的日程
  getByDate: async (date: string): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE}/calendar/events/by-date/${date}`);
    return handleResponse<CalendarEvent[]>(response);
  },

  // 创建日程
  create: async (data: CreateEventRequest): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE}/calendar/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<CalendarEvent>(response);
  },

  // 更新日程
  update: async (id: string, updates: UpdateEventRequest): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE}/calendar/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<CalendarEvent>(response);
  },

  // 删除日程
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/calendar/events/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // 确认日程
  confirm: async (id: string, confirmedBy: 'user' | 'partner' | 'both'): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE}/calendar/events/${id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedBy }),
    });
    return handleResponse<CalendarEvent>(response);
  },

  // 标记为已完成
  markCompleted: async (id: string): Promise<CalendarEvent> => {
    return calendarApi.update(id, { status: 'completed' });
  },

  // 标记为已取消
  markCancelled: async (id: string): Promise<CalendarEvent> => {
    return calendarApi.update(id, { status: 'cancelled' });
  },
};
