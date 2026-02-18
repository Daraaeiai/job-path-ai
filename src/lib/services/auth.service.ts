import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/auth.types";

const AUTH_ENDPOINTS = {
  CHECK_PHONE: "/auth/check-phone",
  REGISTER_SEND_OTP: "/auth/register-send-otp",
  VERIFY_OTP: "/auth/verify-otp",
  REFRESH_TOKEN: "/auth/refresh-token",
  REVOKE_TOKEN: "/auth/revoke-token",
} as const;

function logApi(endpoint: string, payload: unknown, response: unknown) {
  if (typeof window !== "undefined") {
    console.log("[Auth API]", endpoint, { request: payload, response });
  }
}

export const authService = {
  async checkPhone(phoneNumber: string): Promise<
    ApiResponse<{ exists: boolean; otpSent?: boolean }>
  > {
    const payload = { phoneNumber };
    const { data } = await api.post(AUTH_ENDPOINTS.CHECK_PHONE, payload);
    logApi(AUTH_ENDPOINTS.CHECK_PHONE, payload, data);
    return data;
  },

  async registerAndSendOtp(params: {
    phoneNumber: string;
    fullName: string;
  }): Promise<ApiResponse<{ success: boolean; otpSent?: boolean }>> {
    const { data } = await api.post(AUTH_ENDPOINTS.REGISTER_SEND_OTP, params);
    logApi(AUTH_ENDPOINTS.REGISTER_SEND_OTP, params, data);
    return data;
  },

  async verifyOtp(
    phoneNumber: string,
    otp: string
  ): Promise<
    ApiResponse<{
      success?: boolean;
      token?: string;
      refreshToken?: string;
      userId?: string;
      accessTokenExpiresAt?: string;
      refreshTokenExpiresAt?: string;
    }>
  > {
    const payload = { phoneNumber, otp };
    const { data } = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, payload);
    logApi(AUTH_ENDPOINTS.VERIFY_OTP, payload, data);
    return data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken,
    });
    return data;
  },

  async revokeToken(token: string) {
    await api.post(AUTH_ENDPOINTS.REVOKE_TOKEN, { token });
  },
};
