// 数据报表 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 消费趋势数据项
export interface SpendingTrendItem {
  date: string;
  amount: number;
}

// 消费分类数据项
export interface CategoryItem {
  name: string;
  value: number;
  color: string;
}

// 家务贡献数据项
export interface ChoreContributionItem {
  user: string;
  completed: number;
  percentage: number;
}

// 总览数据
export interface OverviewData {
  totalSpending: number;
  totalPoints: number;
  month: string;
}

export const statisticsApi = {
  // 获取总览数据
  getOverview: async (): Promise<OverviewData> => {
    const response = await fetch(`${API_BASE}/statistics/overview`);
    return handleResponse<OverviewData>(response);
  },

  // 获取消费趋势
  getSpendingTrend: async (days: number = 30): Promise<SpendingTrendItem[]> => {
    const response = await fetch(`${API_BASE}/statistics/spending?days=${days}`);
    return handleResponse<SpendingTrendItem[]>(response);
  },

  // 获取消费分类
  getCategories: async (month?: string): Promise<CategoryItem[]> => {
    const url = month 
      ? `${API_BASE}/statistics/categories?month=${month}`
      : `${API_BASE}/statistics/categories`;
    const response = await fetch(url);
    return handleResponse<CategoryItem[]>(response);
  },

  // 获取家务贡献
  getChoresContribution: async (days: number = 30): Promise<ChoreContributionItem[]> => {
    const response = await fetch(`${API_BASE}/statistics/chores?days=${days}`);
    return handleResponse<ChoreContributionItem[]>(response);
  },
};
