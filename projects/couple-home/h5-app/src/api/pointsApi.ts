// 积分系统 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface PointsRecord {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  source: 'chore' | 'vote' | 'checkin' | 'message' | 'redeem';
  description: string;
  balance: number;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  points: number;
  stock: number;
  category: 'coupon' | 'privilege' | 'gift';
  validityDays: number;
}

export interface RedeemedCoupon {
  id: string;
  itemId: string;
  itemName: string;
  code: string;
  points: number;
  status: 'unused' | 'used' | 'expired';
  redeemedAt: string;
  expiresAt: string;
}

export interface PointsSummary {
  totalPoints: number;
  earnedThisWeek: number;
  earnedTotal: number;
  spentTotal: number;
}

export const pointsApi = {
  // 获取积分明细
  getPointsRecords: async (page: number = 1, limit: number = 20): Promise<{
    records: PointsRecord[];
    total: number;
    page: number;
  }> => {
    const response = await fetch(`${API_BASE}/points?page=${page}&limit=${limit}`);
    return handleResponse(response);
  },

  // 获取积分汇总
  getPointsSummary: async (): Promise<PointsSummary> => {
    const response = await fetch(`${API_BASE}/points/summary`);
    return handleResponse(response);
  },

  // 获取积分商城商品列表
  getShopItems: async (): Promise<ShopItem[]> => {
    const response = await fetch(`${API_BASE}/points/shop`);
    return handleResponse(response);
  },

  // 兑换商品
  redeemItem: async (itemId: string): Promise<RedeemedCoupon> => {
    const response = await fetch(`${API_BASE}/points/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    return handleResponse(response);
  },

  // 获取已兑换券码
  getRedeemedCoupons: async (): Promise<RedeemedCoupon[]> => {
    const response = await fetch(`${API_BASE}/points/coupons`);
    return handleResponse(response);
  },

  // 使用券码
  useCoupon: async (couponId: string): Promise<RedeemedCoupon> => {
    const response = await fetch(`${API_BASE}/points/coupons/${couponId}/use`, {
      method: 'POST',
    });
    return handleResponse(response);
  },
};
