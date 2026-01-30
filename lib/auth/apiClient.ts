import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  refreshTokens,
  isRefreshInProgress,
  clearAuthStorage,
  getRefreshToken,
  isTokenExpired,
} from "./tokenManager";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - adds token to requests and proactively refreshes expiring tokens
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const url = config.url || "";
      // Don't add token to refresh endpoint (it uses refresh_token in body)
      if (!url.includes("/auth/refresh")) {
        let token = getAccessToken();

        // Proactively refresh if token is expiring soon (uses 30s buffer in tokenManager)
        if (token && isTokenExpired(token) && getRefreshToken()) {
          try {
            const tokenPair = await refreshTokens();
            token = tokenPair.access_token;
          } catch {
            // If refresh fails, use existing token - let response interceptor handle 401
          }
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Queue for requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor - handles 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors that haven't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest?.url || "";

      // Don't try to refresh for auth endpoints (prevents infinite loops)
      if (url.includes("/auth/")) {
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue this request
      if (isRefreshInProgress()) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      // Check if we have a refresh token
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthStorage();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-logout"));
        }
        return Promise.reject(error);
      }

      // Mark as retry to prevent infinite loops
      originalRequest._retry = true;

      try {
        // Use centralized refresh - handles deduplication internally
        const tokenPair = await refreshTokens();
        const newToken = tokenPair.access_token;

        // Process queued requests with new token
        processQueue(null, newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and notify
        processQueue(refreshError as Error, null);
        clearAuthStorage();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-logout"));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
