// 观影清单 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export type MovieType = 'movie' | 'tv';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number; // 0-10
  review: string;
  watched: boolean;
  watchedAt?: string;
  createdBy: string;
  type: MovieType;
  createdAt: string;
  updatedAt: string;
}

export interface MovieListResponse {
  items: Movie[];
  total: number;
  watched: number;
  unwatched: number;
  avgRating: number;
}

export interface CreateMovieRequest {
  title: string;
  poster?: string;
  type?: MovieType;
}

export interface RateMovieRequest {
  rating: number; // 0-10
  review?: string;
}

export interface MovieStats {
  totalMovies: number;
  watchedMovies: number;
  unwatchedMovies: number;
  avgRating: number;
  movieCount: number;
  tvCount: number;
  watchRate: number;
}

export const movieApi = {
  // 获取观影列表
  getAll: async (params?: {
    watched?: boolean | 'all';
    type?: MovieType | 'all';
    page?: number;
    pageSize?: number;
  }): Promise<MovieListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.watched !== undefined) {
      if (params.watched === 'all') {
        queryParams.append('watched', 'all');
      } else {
        queryParams.append('watched', params.watched ? 'true' : 'false');
      }
    }
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE}/movies${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    return handleResponse<MovieListResponse>(response);
  },

  // 创建观影记录
  create: async (data: CreateMovieRequest): Promise<Movie> => {
    const response = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Movie>(response);
  },

  // 标记为已观看
  markWatched: async (id: string): Promise<Movie> => {
    const response = await fetch(`${API_BASE}/movies/${id}/watched`, {
      method: 'PUT',
    });
    return handleResponse<Movie>(response);
  },

  // 评分和影评
  rate: async (id: string, data: RateMovieRequest): Promise<Movie> => {
    const response = await fetch(`${API_BASE}/movies/${id}/rate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Movie>(response);
  },

  // 删除观影记录
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // 获取统计数据
  getStats: async (): Promise<MovieStats> => {
    const response = await fetch(`${API_BASE}/movies/stats`);
    return handleResponse<MovieStats>(response);
  },

  // 获取评分星级显示
  getRatingStars: (rating: number): string => {
    if (rating <= 0) return '未评分';
    return '⭐'.repeat(Math.ceil(rating / 2));
  },

  // 获取评分文字描述
  getRatingText: (rating: number): string => {
    if (rating === 0) return '未评分';
    if (rating <= 4) return '较差';
    if (rating <= 6) return '一般';
    if (rating <= 8) return '推荐';
    return '神作';
  },

  // 获取评分颜色
  getRatingColor: (rating: number): string => {
    if (rating === 0) return '#9CA3AF';
    if (rating <= 4) return '#EF4444';
    if (rating <= 6) return '#F59E0B';
    if (rating <= 8) return '#10B981';
    return '#8B5CF6';
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

  // 获取类型标签
  getTypeLabel: (type: MovieType): string => {
    return type === 'movie' ? '🎬 电影' : '📺 剧集';
  },

  // 获取类型图标
  getTypeIcon: (type: MovieType): string => {
    return type === 'movie' ? '🎬' : '📺';
  },
};
