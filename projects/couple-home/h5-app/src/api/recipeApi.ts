// AI 菜谱推荐 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 食材接口
export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'vegetable' | 'meat' | 'egg' | 'staple' | 'other';
  expiryDate: string;
  addedDate: string;
  status: 'fresh' | 'warning' | 'expired';
}

// 菜谱接口
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cookTime: number; // 分钟
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  tags: string[];
  imageUrl?: string;
  matchScore: number; // 匹配度 0-100
  missingIngredients: string[]; // 缺少的食材
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  hasInFridge: boolean;
}

// AI 推荐请求
export interface AIRecommendRequest {
  fridgeItemIds?: string[]; // 可选，不传则使用全部冰箱食材
  preferences?: string[]; // 口味偏好
  excludeIngredients?: string[]; // 不想要的食材
  maxResults?: number; // 最大返回数量
}

// AI 推荐响应
export interface AIRecommendResponse {
  recipes: Recipe[];
  totalRecipes: number;
  recommendationReason: string; // AI 推荐理由
}

// 购物清单项
export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedPrice: number;
  recipes: string[]; // 关联的菜谱名称
}

// 购物清单请求
export interface ShoppingListRequest {
  recipeIds: string[]; // 选中的菜谱 ID 列表
}

// 购物清单响应
export interface ShoppingListResponse {
  items: ShoppingListItem[];
  totalEstimatedPrice: number;
  totalItems: number;
}

// 菜谱详情响应
export interface RecipeDetailResponse {
  recipe: Recipe;
  nutritionInfo?: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  tips?: string[];
}

export const recipeApi = {
  // 获取冰箱食材
  getFridgeItems: async (): Promise<FridgeItem[]> => {
    const response = await fetch(`${API_BASE}/fridge`);
    return handleResponse<FridgeItem[]>(response);
  },

  // AI 推荐菜谱
  aiRecommend: async (request: AIRecommendRequest): Promise<AIRecommendResponse> => {
    const response = await fetch(`${API_BASE}/recipes/ai-recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<AIRecommendResponse>(response);
  },

  // 生成购物清单
  generateShoppingList: async (request: ShoppingListRequest): Promise<ShoppingListResponse> => {
    const response = await fetch(`${API_BASE}/recipes/shopping-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<ShoppingListResponse>(response);
  },

  // 获取菜谱详情
  getRecipeDetail: async (id: string): Promise<RecipeDetailResponse> => {
    const response = await fetch(`${API_BASE}/recipes/${id}`);
    return handleResponse<RecipeDetailResponse>(response);
  },

  // 工具函数：获取匹配度颜色
  getMatchScoreColor: (score: number): string => {
    if (score >= 80) return '#5DBF7D'; // 绿色 - 高匹配
    if (score >= 60) return '#FFB5C5'; // 粉色 - 中匹配
    if (score >= 40) return '#FFA502'; // 橙色 - 低匹配
    return '#A0A0A0'; // 灰色 - 很低匹配
  },

  // 工具函数：获取匹配度文字
  getMatchScoreLabel: (score: number): string => {
    if (score >= 80) return '完美匹配';
    if (score >= 60) return '推荐尝试';
    if (score >= 40) return '可以考虑';
    return '需要采购';
  },

  // 工具函数：获取难度标签
  getDifficultyLabel: (difficulty: string): string => {
    const labels: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    };
    return labels[difficulty] || '未知';
  },

  // 工具函数：获取难度颜色
  getDifficultyColor: (difficulty: string): string => {
    const colors: Record<string, string> = {
      easy: '#5DBF7D',
      medium: '#FFB5C5',
      hard: '#FF6B81',
    };
    return colors[difficulty] || '#A0A0A0';
  },

  // 工具函数：格式化时间
  formatCookTime: (minutes: number): string => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  },

  // 工具函数：格式化卡路里
  formatCalories: (calories: number): string => {
    return `${calories}大卡`;
  },
};
