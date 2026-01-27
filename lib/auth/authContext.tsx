"use client";

// =============================================================================
// WARNING: Authentication is currently BYPASSED for development!
// See the login() function below for instructions to revert to real auth.
// =============================================================================

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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const USER_STORAGE_KEY = "user_data";

const isTokenExpired = (token: string): boolean => {
  const payload = authApi.decodeJWT(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setAuthData = useCallback((tokenPair: TokenPair, user: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenPair.access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenPair.refresh_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    setState({
      user,
      token: tokenPair.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await authApi.refreshToken(storedRefreshToken);

      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refresh_token);

      const userProfile = await authApi.getProfile();
      setAuthData(response, userProfile);
    } catch (error) {
      logout();
      throw error;
    }
  }, [setAuthData, logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedUser && !isTokenExpired(storedToken)) {
          const user = JSON.parse(storedUser) as User;
          setState({
            user,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else if (storedToken && isTokenExpired(storedToken)) {
          try {
            await refreshToken();
          } catch (error) {
            console.error(error);
            logout();
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, [refreshToken, logout]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => {
      window.removeEventListener("auth-logout", handleLogout);
    };
  }, [logout]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // =============================================================================
    // DEV BYPASS: Skip actual authentication and use mock data
    // Note: 'password' is intentionally unused during dev bypass
    // TO REVERT: Remove this entire block (lines marked with DEV BYPASS) and
    // uncomment the "REAL AUTH" block below. Also remove the eslint-disable above.
    // =============================================================================
    const mockUser: User = {
      id: "dev-user-001",
      email: email || "driver@example.com",
      firstName: "Dev",
      lastName: "Driver",
      driver: {
        id: "dev-driver-001",
        email: email || "driver@example.com",
        firstName: "Dev",
        lastName: "Driver",
        createdAt: new Date().toISOString(),
      },
    };
    const mockTokens: TokenPair = {
      access_token: "dev-mock-access-token",
      refresh_token: "dev-mock-refresh-token",
    };
    setAuthData(mockTokens, mockUser);
    return;
    // =============================================================================
    // END DEV BYPASS
    // =============================================================================

    // =============================================================================
    // REAL AUTH: Uncomment this block when ready to use real authentication
    // =============================================================================
    // try {
    //   const response = await authApi.login(email, password);
    //
    //   localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    //   localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refresh_token);
    //
    //   const userProfile = await authApi.getProfile();
    //   setAuthData(response, userProfile);
    // } catch (error) {
    //   setState((prev) => ({ ...prev, isLoading: false }));
    //   throw error;
    // }
    // =============================================================================
    // END REAL AUTH
    // =============================================================================
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
