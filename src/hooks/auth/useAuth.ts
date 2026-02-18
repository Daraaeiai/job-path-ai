import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const {
    isAuthenticated,
    user,
    login: storeLogin,
    logout,
  } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("token-cleared"));
    }
  }, [logout]);

  return {
    isAuthenticated,
    user,
    login: storeLogin,
    logout: handleLogout,
  };
}
