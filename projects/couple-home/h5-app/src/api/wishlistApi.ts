// 愿望清单 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export type WishlistStatus = 'pending' | 'completed';

export interface WishlistContribution {
  id: string;
  itemId: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  budget: number;
  currentAmount: number;
  progress: number; // 进度百分比 0-100
  priority: number; // 1-5 星
  status: WishlistStatus;
  deadline?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  contributions?: WishlistContribution[];
  myContribution: number;
}

export interface WishlistListResponse {
  items: WishlistItem[];
  total: number;
  completed: number;
  pending: number;
  totalBudget: number;
}

export interface CreateWishlistItemRequest {
  title: string;
  description?: string;
  budget: number;
  priority: number; // 1-5
  deadline?: string;
}

export interface ContributeRequest {
  amount: number;
}

export interface WishlistStats {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  totalBudget: number;
  totalContributed: number;
  completionRate: number;
}

export const wishlistApi = {
  // 获取愿望列表
  getAll: async (params?: {
    status?: WishlistStatus | 'all';
    page?: number;
    pageSize?: number;
  }): Promise<WishlistListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE}/wishlist${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    return handleResponse<WishlistListResponse>(response);
  },

  // 创建愿望
  create: async (data: CreateWishlistItemRequest): Promise<WishlistItem> => {
    const response = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<WishlistItem>(response);
  },

  // 为愿望助力
  contribute: async (id: string, amount: number): Promise<WishlistItem> => {
    const response = await fetch(`${API_BASE}/wishlist/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return handleResponse<WishlistItem>(response);
  },

  // 标记愿望完成
  complete: async (id: string): Promise<WishlistItem> => {
    const response = await fetch(`${API_BASE}/wishlist/${id}/complete`, {
      method: 'PUT',
    });
    return handleResponse<WishlistItem>(response);
  },

  // 删除愿望
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/wishlist/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // 获取统计数据
  getStats: async (): Promise<WishlistStats> => {
    const response = await fetch(`${API_BASE}/wishlist/stats`);
    return handleResponse<WishlistStats>(response);
  },

  // 获取优先级星级显示
  getPriorityStars: (priority: number): string => {
    return '⭐'.repeat(priority);
  },

  // 获取进度百分比格式化
  formatProgress: (progress: number): string => {
    return `${progress.toFixed(1)}%`;
  },

  // 格式化金额
  formatCurrency: (amount: number): string => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // 格式化日期
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // 获取优先级颜色
  getPriorityColor: (priority: number): string => {
    const colors: Record<number, string> = {
      5: '#FF4757', // 非常想要 - 红色
      4: '#FFA502', // 很想要 - 橙色
      3: '#FFD93D', // 想要 - 黄色
      2: '#4A90D9', // 可以考虑 - 蓝色
      1: '#A0A0A0', // 随便 - 灰色
    };
    return colors[priority] || colors[3];
  },

  // 获取状态标签
  getStatusLabel: (status: WishlistStatus): string => {
    return status === 'pending' ? '待实现' : '已完成';
  },

  // 获取状态颜色
  getStatusColor: (status: WishlistStatus): string => {
    return status === 'pending' ? '#FFB5C5' : '#5DBF7D';
  },
};
