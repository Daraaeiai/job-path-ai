import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const getApiBaseUrl = (): string => {
  return typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "/api"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
};

export const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") return config;
    try {
      const stored = localStorage.getItem("auth-storage");
      const state = stored ? JSON.parse(stored)?.state : null;
      const token = state?.accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("auth-storage");
        window.dispatchEvent(new CustomEvent("token-cleared"));
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);
