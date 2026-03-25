// API 客户端 - 连接后端服务
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 冰箱管理 API
export const fridgeApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/fridge`);
    return handleResponse(response);
  },
  
  getExpiring: async () => {
    const response = await fetch(`${API_BASE}/fridge/expiring`);
    return handleResponse(response);
  },
  
  add: async (item: { name: string; quantity: number; unit: string; category: string; expiryDate: string }) => {
    const response = await fetch(`${API_BASE}/fridge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },
  
  update: async (id: string, updates: Partial<any>) => {
    const response = await fetch(`${API_BASE}/fridge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/fridge/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// 菜谱管理 API
export const recipeApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/recipes`);
    return handleResponse(response);
  },
  
  getRandom: async (limit: number = 3) => {
    const response = await fetch(`${API_BASE}/recipes/random?limit=${limit}`);
    return handleResponse(response);
  },
  
  recommend: async (fridgeItems: any[], preferences: any) => {
    const response = await fetch(`${API_BASE}/recipes/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fridgeItems, preferences }),
    });
    return handleResponse(response);
  },
  
  vote: async (recipeId: string, rating: number) => {
    const response = await fetch(`${API_BASE}/recipes/${recipeId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return handleResponse(response);
  },
};

// 账单管理 API
export const billApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/bills`);
    return handleResponse(response);
  },
  
  getStats: async () => {
    const response = await fetch(`${API_BASE}/bills/stats`);
    return handleResponse(response);
  },
  
  create: async (bill: { title: string; amount: number; payer: string; category: string; date?: string; note?: string }) => {
    const response = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });
    return handleResponse(response);
  },
};

// 共同基金 API
export const fundApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/bills/fund`);
    return handleResponse(response);
  },
  
  contribute: async (fundId: string, amount: number, contributor: string, note?: string) => {
    const response = await fetch(`${API_BASE}/bills/fund/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundId, amount, contributor, note }),
    });
    return handleResponse(response);
  },
};

// 健康检查
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
  return response.ok;
};
