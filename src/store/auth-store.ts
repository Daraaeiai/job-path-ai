import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth.types";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  login: (
    phoneNumber: string,
    accessToken: string,
    refreshToken: string,
    userId?: string,
    accessTokenExpiresAt?: string,
    refreshTokenExpiresAt?: string
  ) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,

      login: (
        phoneNumber,
        accessToken,
        refreshToken,
        userId,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
      ) => {
        set({
          isAuthenticated: true,
          user: { id: userId ?? "", phoneNumber },
          accessToken,
          refreshToken,
          accessTokenExpiresAt: accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: refreshTokenExpiresAt ?? null,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      isTokenValid: () => {
        const state = get();
        if (!state.refreshToken || !state.refreshTokenExpiresAt) return false;
        return new Date() < new Date(state.refreshTokenExpiresAt);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
