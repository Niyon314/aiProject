// 恋爱日记 API 客户端
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 通用请求处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data as T;
}

export interface Diary {
  id: string;
  content: string;
  privacy: 'private' | 'shared';
  date: string; // YYYY-MM-DD
  photos: string[]; // Array of photo URLs
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiaryRequest {
  content: string;
  privacy?: 'private' | 'shared';
  date: string; // YYYY-MM-DD
  photos?: string[];
}

export interface UpdateDiaryRequest {
  content?: string;
  privacy?: 'private' | 'shared';
}

export interface PhotoUploadRequest {
  photoUrls: string[];
}

export interface PrivacyUpdateRequest {
  privacy: 'private' | 'shared';
}

export interface DiaryListResponse {
  diaries: Diary[];
  total: number;
}

export const diaryApi = {
  // 获取日记列表
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    date?: string;
    month?: string; // YYYY-MM
    privacy?: string;
  }): Promise<DiaryListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.date) queryParams.append('date', params.date);
    if (params?.month) queryParams.append('month', params.month);
    if (params?.privacy) queryParams.append('privacy', params.privacy);

    const response = await fetch(`${API_BASE}/diaries?${queryParams.toString()}`);
    return handleResponse<DiaryListResponse>(response);
  },

  // 获取指定月份的日记（月视图）
  getByMonth: async (month: string): Promise<Diary[]> => {
    const response = await fetch(`${API_BASE}/diaries/month/${month}`);
    return handleResponse<Diary[]>(response);
  },

  // 获取单篇日记
  getById: async (id: string): Promise<Diary> => {
    const response = await fetch(`${API_BASE}/diaries/${id}`);
    return handleResponse<Diary>(response);
  },

  // 创建日记
  create: async (data: CreateDiaryRequest): Promise<Diary> => {
    const response = await fetch(`${API_BASE}/diaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Diary>(response);
  },

  // 更新日记
  update: async (id: string, updates: UpdateDiaryRequest): Promise<Diary> => {
    const response = await fetch(`${API_BASE}/diaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Diary>(response);
  },

  // 删除日记
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/diaries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // 上传照片
  uploadPhotos: async (id: string, photoUrls: string[]): Promise<Diary> => {
    const response = await fetch(`${API_BASE}/diaries/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrls }),
    });
    return handleResponse<Diary>(response);
  },

  // 设置隐私
  updatePrivacy: async (id: string, privacy: 'private' | 'shared'): Promise<Diary> => {
    const response = await fetch(`${API_BASE}/diaries/${id}/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privacy }),
    });
    return handleResponse<Diary>(response);
  },
};
