import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { authApi as AuthApiType } from "./authApi";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

let authApiInstance: typeof AuthApiType | null = null;
const getAuthApi = async () => {
  if (!authApiInstance) {
    const { authApi } = await import("./authApi");
    authApiInstance = authApi;
  }
  return authApiInstance;
};

const isTokenExpiringSoon = (token: string, bufferSeconds = 60): boolean => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    if (!payload.exp) return true;
    return Date.now() >= (payload.exp - bufferSeconds) * 1000;
  } catch {
    return true;
  }
};

let refreshPromise: Promise<string> | null = null;

const ensureFreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  if (!isTokenExpiringSoon(token)) {
    return token;
  }

  // Token is expiring soon — proactively refresh
  if (refreshPromise) {
    return refreshPromise;
  }

  const storedRefreshToken = localStorage.getItem("refresh_token");
  if (!storedRefreshToken) return null;

  refreshPromise = (async () => {
    try {
      const authApi = await getAuthApi();
      const tokenData = await authApi.refreshToken(storedRefreshToken);
      localStorage.setItem("auth_token", tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token);
      return tokenData.access_token;
    } catch {
      return token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const url = config.url || "";
      if (!url.includes("/auth/refresh")) {
        const freshToken = await ensureFreshToken();
        if (freshToken && config.headers) {
          config.headers.Authorization = `Bearer ${freshToken}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const url = originalRequest.url || "";

      if (url.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
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

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error("No refresh token"), null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-logout"));
        }
        return Promise.reject(error);
      }

      try {
        const authApi = await getAuthApi();
        const tokenData = await authApi.refreshToken(refreshToken);

        const { access_token, refresh_token: newRefreshToken } = tokenData;

        localStorage.setItem("auth_token", access_token);
        localStorage.setItem("refresh_token", newRefreshToken);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-logout"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
