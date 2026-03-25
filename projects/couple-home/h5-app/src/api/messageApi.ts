// 留言板 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  content: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  unreadCount: number;
}

export const messageApi = {
  // 获取留言列表
  getList: async (): Promise<MessageListResponse> => {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse<MessageListResponse>(response);
  },

  // 发送留言
  create: async (data: CreateMessageRequest): Promise<Message> => {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Message>(response);
  },

  // 标记为已读
  markAsRead: async (id: string): Promise<Message> => {
    const response = await fetch(`${API_BASE}/messages/${id}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    return handleResponse<Message>(response);
  },

  // 批量标记为已读
  markAllAsRead: async (): Promise<void> => {
    const response = await fetch(`${API_BASE}/messages/read-all`, {
      method: 'PUT',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },
};
