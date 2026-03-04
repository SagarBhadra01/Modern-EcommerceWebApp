import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Waits for Clerk to initialize and returns a session token.
 * Retries up to 10 times with 300ms delay to handle cases where
 * Clerk hasn't initialized yet when the first API calls fire.
 */
async function getClerkToken(retries = 10): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) return token;
      }
    } catch {
      // Clerk not ready yet
    }
    // Wait before retrying
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return null;
}

// Attach Clerk session token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getClerkToken();
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
    const status = error.response?.status;
    const data = error.response?.data;
    // Log for debugging — shows full Zod field errors
    console.error(`API Error [${status}]:`, data || error.message);
    return Promise.reject(error);
  }
);
