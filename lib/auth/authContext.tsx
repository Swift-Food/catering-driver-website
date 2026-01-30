"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AuthState, User, TokenPair } from "./types";
import { authApi } from "./authApi";
import {
  getAccessToken,
  getRefreshToken,
  getUserData,
  isTokenExpired,
  refreshTokens,
  clearAuthStorage,
  saveTokens,
  saveUserData,
} from "./tokenManager";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Logout - clears all auth state
  const logout = useCallback(() => {
    clearAuthStorage();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Set auth data after successful login/refresh
  const setAuthData = useCallback((tokenPair: TokenPair, user: User) => {
    saveTokens(tokenPair);
    saveUserData(user);
    setState({
      user,
      token: tokenPair.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // Refresh token - uses centralized tokenManager to prevent race conditions
  const refreshToken = useCallback(async () => {
    try {
      // Uses centralized refresh - automatically deduplicates concurrent calls
      const tokenPair = await refreshTokens();

      // Fetch fresh user profile after refresh
      const userProfile = await authApi.getProfile();
      setAuthData(tokenPair, userProfile);
    } catch (error) {
      logout();
      throw error;
    }
  }, [setAuthData, logout]);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = getAccessToken();
        const storedUser = getUserData<User>();

        if (!storedToken) {
          // No token - not authenticated
          if (mounted) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
          return;
        }

        if (storedUser && !isTokenExpired(storedToken)) {
          // Valid token and cached user - use them
          if (mounted) {
            setState({
              user: storedUser,
              token: storedToken,
              isLoading: false,
              isAuthenticated: true,
            });
          }
          return;
        }

        // Token expired or no user data - try to refresh
        if (getRefreshToken()) {
          try {
            await refreshToken();
          } catch (error) {
            console.error("Token refresh failed during init:", error);
            // refreshToken already calls logout on failure
          }
        } else {
          // No refresh token - clear and set as not authenticated
          if (mounted) {
            logout();
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (mounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty deps - only run on mount

  // Listen for logout events from apiClient (e.g., when refresh fails)
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => {
      window.removeEventListener("auth-logout", handleLogout);
    };
  }, [logout]);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.login(email, password);

      // Save tokens first
      saveTokens(response);

      // Then fetch profile
      const userProfile = await authApi.getProfile();

      // Only update state after everything succeeds
      setAuthData(response, userProfile);
    } catch (error) {
      // Clean up any partial state on failure
      clearAuthStorage();
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
