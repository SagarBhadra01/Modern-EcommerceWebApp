import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Clerk session token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently continue — public routes don't need auth
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Override the types to reflect that the interceptor unwraps the response data
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  }
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
