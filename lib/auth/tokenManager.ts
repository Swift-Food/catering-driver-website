// tokenManager.ts - Single source of truth for token refresh
// Prevents race conditions by coordinating all refresh attempts

import type { TokenPair } from "./types";

const TOKEN_STORAGE_KEY = "auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const USER_STORAGE_KEY = "user_data";

// Module-level state - shared across all consumers
let isRefreshing = false;
let refreshPromise: Promise<TokenPair> | null = null;
let authApiInstance: typeof import("./authApi").authApi | null = null;

const getAuthApi = async () => {
  if (!authApiInstance) {
    const { authApi } = await import("./authApi");
    authApiInstance = authApi;
  }
  return authApiInstance;
};

/**
 * Get current access token from storage
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Get current refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

/**
 * Check if token is expired (with 30 second buffer)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token?.split(".")[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    if (!payload || !payload.exp) return true;

    // 30 second buffer - refresh before actual expiry
    const bufferMs = 30 * 1000;
    return Date.now() >= payload.exp * 1000 - bufferMs;
  } catch {
    return true;
  }
};

/**
 * Check if a refresh is currently in progress
 */
export const isRefreshInProgress = (): boolean => isRefreshing;

/**
 * Single coordinated refresh function
 * - If refresh is already in progress, returns the existing promise
 * - Prevents concurrent refresh attempts
 */
export const refreshTokens = async (): Promise<TokenPair> => {
  // If already refreshing, return existing promise (deduplication)
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const authApi = await getAuthApi();
      const tokenPair = await authApi.refreshToken(storedRefreshToken);

      // Update storage atomically
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenPair.access_token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenPair.refresh_token);

      return tokenPair;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Clear all auth data from storage
 */
export const clearAuthStorage = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Save tokens to storage
 */
export const saveTokens = (tokenPair: TokenPair): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, tokenPair.access_token);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenPair.refresh_token);
};

/**
 * Save user data to storage
 */
export const saveUserData = (user: unknown): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

/**
 * Get user data from storage
 */
export const getUserData = <T>(): T | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};
