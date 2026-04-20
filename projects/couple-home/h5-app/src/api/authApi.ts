// 认证 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

// 存储 token
function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 清除 token
function clearToken(): void {
  localStorage.removeItem('auth_token');
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
  };
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
  inviteCode?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  coupleId?: string;
  partner?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

export const authApi = {
  // 登录
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await handleResponse<LoginResponse>(response);
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },

  // 注册
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<LoginResponse>(response);
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },

  // 获取当前用户信息
  getMe: async (): Promise<UserInfo> => {
    const token = getToken();
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return handleResponse<UserInfo>(response);
  },

  // 登出
  logout: (): void => {
    clearToken();
  },

  // 检查是否已登录
  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  // 获取 token
  getToken: (): string | null => {
    return getToken();
  },
};
