// 想吃清单 API
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 想吃清单项
export interface MealWish {
  id: string;
  name: string;
  icon: string;
  category: 'home_cook' | 'restaurant' | 'takeout' | 'snack';
  priority: 'must_eat' | 'want' | 'maybe';
  addedBy: string;
  note: string;
  status: 'pending' | 'done' | 'archived';
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 吃饭历史
export interface MealHistory {
  id: string;
  name: string;
  icon: string;
  source: 'random' | 'wishlist' | 'ai' | 'manual';
  rating: number;
  comment: string;
  createdAt: string;
}

// 随机推荐结果
export interface MealRecommendation {
  recipe: {
    id: string;
    name: string;
    icon: string;
    cookTime: number;
    difficulty: string;
    tags: string[];
    ingredients: { name: string; icon: string }[];
  };
  matchedFridgeItems: string[];
  reason: string;
}

export const mealWishApi = {
  // 想吃清单
  getWishes: async (status?: string): Promise<MealWish[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE}/meal/wishes${params}`);
    return handleResponse<MealWish[]>(response);
  },

  addWish: async (data: Partial<MealWish>): Promise<MealWish> => {
    const response = await fetch(`${API_BASE}/meal/wishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MealWish>(response);
  },

  updateWish: async (id: string, data: Partial<MealWish>): Promise<MealWish> => {
    const response = await fetch(`${API_BASE}/meal/wishes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MealWish>(response);
  },

  deleteWish: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/meal/wishes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  },

  markDone: async (id: string, rating?: number, comment?: string): Promise<MealWish> => {
    const response = await fetch(`${API_BASE}/meal/wishes/${id}/done`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    return handleResponse<MealWish>(response);
  },

  // 随机推荐
  getRecommendation: async (category?: string): Promise<MealRecommendation> => {
    const params = category ? `?category=${category}` : '';
    const response = await fetch(`${API_BASE}/meal/recommend${params}`);
    return handleResponse<MealRecommendation>(response);
  },

  // 吃饭历史
  getHistory: async (limit?: number): Promise<MealHistory[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${API_BASE}/meal/history${params}`);
    return handleResponse<MealHistory[]>(response);
  },

  addHistory: async (data: Partial<MealHistory>): Promise<MealHistory> => {
    const response = await fetch(`${API_BASE}/meal/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MealHistory>(response);
  },
};
