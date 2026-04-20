import { create } from 'zustand';
import { authApi, type UserInfo, type LoginRequest, type RegisterRequest } from '../api/authApi';

interface AuthState {
  // 状态
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  checkAuth: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 初始状态
  user: null,
  token: authApi.getToken(),
  isAuthenticated: authApi.isAuthenticated(),
  isLoading: false,
  error: null,

  // 登录
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login(credentials);
      set({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 注册
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.register(data);
      set({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 登出
  logout: () => {
    authApi.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // 加载用户信息
  loadUser: async () => {
    if (!get().isAuthenticated) {
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Failed to load user info:', error);
      // Token 可能已过期，清除认证状态
      get().logout();
      set({ isLoading: false });
    }
  },

  // 检查认证状态
  checkAuth: (): boolean => {
    const isAuth = authApi.isAuthenticated();
    set({ isAuthenticated: isAuth, token: authApi.getToken() });
    return isAuth;
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));
