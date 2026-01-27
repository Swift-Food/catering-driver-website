import apiClient from "./apiClient";
import { LoginResponse, TokenPair, User } from "./types";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login-driver", {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; user: User }>(
      "/auth/profile"
    );
    return response.data.user;
  },

  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const response = await apiClient.post<TokenPair>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  decodeJWT: (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  },
};
