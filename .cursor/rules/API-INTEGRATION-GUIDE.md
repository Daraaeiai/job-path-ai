# 📚 راهنمای جامع یکپارچگی با API های بک‌اند - Fintellect

## فهرست مطالب
1. [معماری API Layer](#1-معماری-api-layer)
2. [Axios Configuration](#2-axios-configuration)
3. [React Query (TanStack Query)](#3-react-query-tanstack-query)
4. [Zod Validation در API Layer](#4-zod-validation-در-api-layer)
5. [Type Safety](#5-type-safety)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Authentication Flow](#7-authentication-flow)
8. [مثال‌های عملی](#8-مثالهای-عملی)

---

## 1. معماری API Layer

### 1.1 ساختار کلی فولدر API Services

```
src/
├── lib/
│   ├── api.ts                    # Axios instance اصلی + interceptors
│   ├── services/                 # سرویس‌های API بر اساس Domain
│   │   ├── auth.service.ts       # احراز هویت
│   │   ├── chat.service.ts       # چت و پیام‌ها
│   │   └── payment.service.ts    # پرداخت
│   ├── utils/
│   │   ├── token.ts              # مدیریت توکن‌ها
│   │   ├── cookies.ts            # مدیریت کوکی‌ها
│   │   └── auth.ts               # توابع کمکی احراز هویت
│   └── validations/
│       └── auth.ts               # Zod schemas
│
├── hooks/
│   ├── auth/
│   │   ├── useAuth.ts            # هوک احراز هویت
│   │   ├── useAuthMutations.ts   # mutations احراز هویت
│   │   └── useTokenSecurity.ts   # امنیت توکن
│   └── chat/
│       ├── useChatManager.ts     # مدیریت چت
│       ├── useChatMutations.ts   # mutations چت
│       └── useChatHistory.ts     # تاریخچه چت
│
├── app/api/proxy/[...path]/      # Next.js API Proxy
│   └── route.ts
│
└── types/
    ├── auth.types.ts             # تایپ‌های احراز هویت
    ├── chat.types.ts             # تایپ‌های چت
    └── payment.types.ts          # تایپ‌های پرداخت
```

### 1.2 سازماندهی Endpoints

```typescript
// src/lib/api.ts
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    VERIFY_OTP: '/api/auth/verify-otp',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    REVOKE_TOKEN: '/api/auth/revoke-token',
    REVOKE_ALL_TOKENS: '/api/auth/revoke-all-tokens'
  },
  CHAT: {
    SEND_MESSAGE: '/api/chat',
    SEND_ANONYMOUS: '/api/chat/anonymous'
  }
};

// src/lib/services/chat.service.ts
const API_ENDPOINTS = {
  CHAT: '/api/chat',
  CHAT_HISTORY: '/api/chat/history',
  CANCEL_MESSAGE: (chatMessageId: number) => `/api/chat/message/${chatMessageId}`,
  RETRY_MESSAGE: (chatMessageId: number) => `/api/chat/message/${chatMessageId}/retry`
};
```

### 1.3 تفکیک API Calls بر اساس Domain/Feature

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
├─────────────────────────────────────────────────────────┤
│  auth.service.ts    │  chat.service.ts  │  payment.service.ts
│  ─────────────────  │  ───────────────  │  ─────────────────
│  • sendOtp()        │  • sendMessage()  │  • requestPayment()
│  • verifyOtp()      │  • getChatHistory()│
│  • refreshToken()   │  • cancelMessage()│
│  • revokeToken()    │  • retryMessage() │
│  • revokeAllTokens()│                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Axios Instance (api.ts)                 │
│  • Base URL Configuration                                │
│  • Request Interceptors (Token injection)                │
│  • Response Interceptors (Token refresh, Error handling) │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Proxy (/api/proxy)              │
│  • CORS handling                                         │
│  • Request forwarding to Backend                         │
│  • Response transformation                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                        │
│              (https://service.syntellect.vip)            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Axios Configuration

### 2.1 تنظیمات Base Instance

```typescript
// src/lib/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from './utils/token';

const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
};

const API_BASE_URL = getApiBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
  timeout: 30000,  // 30 seconds default timeout
});

export { api };
```

### 2.2 Request Interceptors

```typescript
// src/lib/api.ts
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // اضافه کردن Token به Header
    const token = TokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2.3 Response Interceptors با Token Refresh

```typescript
// src/lib/api.ts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // اگر در حال refresh هستیم، درخواست را به صف اضافه کن
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/chat';
        }
        return Promise.reject(error);
      }

      try {
        // درخواست refresh token
        const response = await api.post<RefreshResponse>(
          API_ENDPOINTS.AUTH.REFRESH_TOKEN,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // ذخیره توکن‌های جدید
        TokenManager.setTokens(newAccessToken, newRefreshToken);

        // آپدیت header درخواست اصلی
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // پردازش صف درخواست‌های منتظر
        processQueue(null, newAccessToken);

        // تکرار درخواست اصلی
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        TokenManager.clearTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/chat';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### 2.4 Next.js API Proxy

```typescript
// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://service.syntellect.vip';

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(`${BACKEND_API_URL}/${path}`);

    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };

    // Copy authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(1200000), // 20 minutes timeout
    };

    // Add body for non-GET requests
    if (method !== 'GET') {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    // Make the request to backend
    const response = await fetch(url.toString(), requestOptions);

    // Handle response
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
      return NextResponse.json(responseData, { status: response.status });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'GET');
}

export async function POST(request: NextRequest, { params }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(request: NextRequest, { params }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(request: NextRequest, { params }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'DELETE');
}
```

### 2.5 Timeout و Custom Configuration

```typescript
// Custom timeout برای درخواست‌های طولانی (مثل چت)
const response = await api.post(endpoint, {
  question: message,
  maxRounds: 1
}, {
  timeout: 900000,  // 15 minutes برای پاسخ‌های طولانی
  transformResponse: [(data) => {
    if (!data) return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;  // Return as string if not JSON
    }
  }]
});
```


---

## 3. React Query (TanStack Query)

### 3.1 تنظیمات QueryClient و Provider

```typescript
// src/components/providers/QueryProvider.tsx
"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,        // 1 minute - داده تازه
          refetchOnWindowFocus: false,  // عدم refetch در focus
          // gcTime: 5 * 60 * 1000,     // 5 minutes - garbage collection
          // retry: 3,                   // تعداد retry
          // retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3.2 استفاده از useMutation برای POST/PUT/DELETE

#### Auth Mutations

```typescript
// src/hooks/auth/useAuthMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { TokenManager } from "@/lib/utils/token";

// Send OTP mutation
export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: (response: AuthResponse) => {
      // کامپوننت response.success را چک می‌کند
    },
    onError: (error: Error) => {
      console.error("Send OTP error:", error);
    },
  });
};

// Verify OTP mutation
export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response: AuthResponse, variables) => {
      if (response.success && response.token && response.refreshToken) {
        // ذخیره توکن‌ها
        TokenManager.setTokens(response.token, response.refreshToken);

        // محاسبه تاریخ انقضا (7 روز)
        const accessTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        const refreshTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        // آپدیت auth store
        login(
          variables.phoneNumber,
          response.token,
          response.refreshToken,
          response.userId,
          accessTokenExpiresAt,
          refreshTokenExpiresAt
        );

        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      }
    },
    onError: (error: Error) => {
      console.error("Verify OTP error:", error);
    },
  });
};

// Refresh token mutation
export const useRefreshToken = () => {
  const { setTokens } = useAuthStore();

  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.token && response.refreshToken) {
        TokenManager.setTokens(response.token, response.refreshToken);
        setTokens(response.token, response.refreshToken);
      } else {
        throw new Error(response.message || "خطا در تمدید توکن");
      }
    },
    onError: (error: Error) => {
      console.error("Refresh token error:", error);
      TokenManager.clearTokens();
    },
  });
};

// Revoke token mutation (Logout)
export const useRevokeToken = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: (token: string) => authService.revokeToken(token),
    onSuccess: () => {
      TokenManager.clearTokens();
      logout();
    },
    onError: (error: Error) => {
      console.error("Revoke token error:", error);
      // حتی در صورت خطا، logout انجام شود
      TokenManager.clearTokens();
      logout();
    },
  });
};
```

#### Chat Mutations

```typescript
// src/hooks/chat/useChatMutations.ts
import { useMutation } from '@tanstack/react-query';
import { chatService, ChatRequest, ChatResponse } from '@/lib/services/chat.service';

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: (data: ChatRequest) => chatService.sendMessage(data),
    onError: (error: Error) => {
      console.error('Send chat message error:', error);
    }
  });
};
```

### 3.3 Custom Hook برای Chat History (بدون useQuery)

```typescript
// src/hooks/chat/useChatHistory.ts
import { useState, useCallback, useEffect } from 'react';
import { chatService } from '@/lib/services/chat.service';
import { ChatHistoryResponse, ChatHistoryMessage, Message } from '@/types';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 0,
    totalPages: 1,
    totalMessages: 0,
    freeMessagesUsed: 0,
    paidMessages: 0
  });

  const loadChatHistory = useCallback(async (page: number = 1, pageSize?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ChatHistoryResponse = await chatService.getChatHistory(page, pageSize);

      if (response.success) {
        setChatHistory(response.messages);
        setPagination({
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          totalMessages: response.totalMessages,
          freeMessagesUsed: response.freeMessagesUsed,
          paidMessages: response.paidMessages
        });
      } else {
        setError('خطا در دریافت تاریخچه چت');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'خطا در دریافت تاریخچه چت');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تبدیل تاریخچه به فرمت Message
  const convertHistoryToMessages = useCallback((historyMessages: ChatHistoryMessage[]): Message[] => {
    const messages: Message[] = [];

    const sortedHistoryMessages = [...historyMessages].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedHistoryMessages.forEach((historyMsg) => {
      const hasResponse = historyMsg.response !== null && historyMsg.response !== '';
      
      // پیام کاربر
      const userMessage: Message = {
        id: `user-${historyMsg.id}`,
        content: historyMsg.question,
        role: 'user',
        timestamp: new Date(historyMsg.createdAt),
        chatMessageId: historyMsg.id,
        canRetry: hasResponse ? false : historyMsg.canRetry,
        hasPayment: hasResponse ? false : historyMsg.hasPayment,
        isPaid: hasResponse ? true : historyMsg.isPaid,
      };
      messages.push(userMessage);

      // پیام دستیار (اگر پاسخ وجود دارد)
      if (hasResponse) {
        let assistantContent = '';
        try {
          const responseData = JSON.parse(historyMsg.response);
          assistantContent = responseData.debate_result || responseData.message || 'پاسخ دریافت شد';
        } catch {
          assistantContent = historyMsg.response!;
        }

        const assistantMessage: Message = {
          id: `assistant-${historyMsg.id}`,
          content: assistantContent,
          role: 'assistant',
          timestamp: new Date(historyMsg.responseReceivedAt || historyMsg.createdAt),
          chatMessageId: historyMsg.id,
        };
        messages.push(assistantMessage);
      }
    });

    return messages;
  }, []);

  // Load more برای infinite scroll
  const loadMoreHistory = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages && !isLoading) {
      setIsLoading(true);
      try {
        const response = await chatService.getChatHistory(
          pagination.currentPage + 1,
          pagination.pageSize
        );

        if (response.success) {
          const sortedNewMessages = [...response.messages].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          setChatHistory(prev => [...sortedNewMessages, ...prev]);
          setPagination(prev => ({
            ...prev,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
          }));
        }
      } catch (err) {
        setError('خطا در دریافت چت‌های بیشتر');
      } finally {
        setIsLoading(false);
      }
    }
  }, [pagination, isLoading]);

  // پاک کردن تاریخچه در logout
  useEffect(() => {
    const handleLogout = () => {
      setChatHistory([]);
      setError(null);
      setPagination({
        currentPage: 1,
        pageSize: 0,
        totalPages: 1,
        totalMessages: 0,
        freeMessagesUsed: 0,
        paidMessages: 0
      });
    };

    window.addEventListener('token-cleared', handleLogout);
    return () => window.removeEventListener('token-cleared', handleLogout);
  }, []);

  return {
    chatHistory,
    isLoading,
    error,
    pagination,
    loadChatHistory,
    loadMoreHistory,
    convertHistoryToMessages
  };
};
```

### 3.4 استفاده از Mutations در کامپوننت‌ها

```typescript
// src/components/auth/AuthModal.tsx
import { useSendOtp, useVerifyOtp } from "@/hooks/auth";

export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    try {
      const response = await sendOtpMutation.mutateAsync({
        phoneNumber: data.phoneNumber,
      });

      if (response.success) {
        setStep("otp");
        setOtpCountdown(120);
      } else {
        setError(response.message || "خطا در ارسال کد تایید");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        phoneNumber: phoneNumber,
        otp: otp,
      });

      if (response.success) {
        onSuccess();
        window.dispatchEvent(new CustomEvent("token-updated"));
      } else {
        setError(response.message || "کد تایید اشتباه است");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تایید کد");
    }
  };

  // ...
}
```


---

## 4. Zod Validation در API Layer

### 4.1 ساختار Schema ها

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

// Schema برای شماره تلفن
export const phoneNumberSchema = z.string()
  .min(1, 'شماره تلفن الزامی است')
  .refine((phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(cleanPhone);
  }, 'شماره تلفن باید 11 رقم باشد و با 09 شروع شود');

// Schema برای نام فارسی
const persianNameSchema = z.string()
  .min(2, 'حداقل 2 کاراکتر الزامی است')
  .max(50, 'حداکثر 50 کاراکتر مجاز است')
  .regex(/^[\u0600-\u06FF\s]+$/, 'فقط حروف فارسی مجاز است');

// Schema برای OTP
const otpSchema = z.string()
  .length(6, 'کد تایید باید 6 رقم باشد')
  .regex(/^\d{6}$/, 'کد تایید باید شامل اعداد باشد');

// Schema های ترکیبی برای فرم‌ها
export const phoneFormSchema = z.object({
  phoneNumber: phoneNumberSchema
});

export const loginFormSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema,
  phoneNumber: phoneNumberSchema
});

export const otpFormSchema = z.object({
  otp: z.array(z.string().length(1, 'هر خانه باید یک رقم باشد'))
    .length(6, 'کد تایید باید 6 رقم باشد')
});

// Schema های API Request
export const sendOtpRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  captchaToken: z.string().optional()
});

export const verifyOtpRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: otpSchema,
  firstName: persianNameSchema.optional(),
  lastName: persianNameSchema.optional()
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
```

### 4.2 Type Inference از Zod Schemas

```typescript
// src/lib/validations/auth.ts

// استخراج تایپ از Schema
export type LoginFormData = z.infer<typeof loginFormSchema>;
// Result: { firstName: string; lastName: string; phoneNumber: string }

export type OtpFormData = z.infer<typeof otpFormSchema>;
// Result: { otp: string[] }

export type SendOtpRequest = z.infer<typeof sendOtpRequestSchema>;
// Result: { phoneNumber: string; captchaToken?: string }

export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
// Result: { phoneNumber: string; otp: string; firstName?: string; lastName?: string }
```

### 4.3 استفاده با React Hook Form

```typescript
// src/components/auth/AuthModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneFormSchema } from "@/lib/validations/auth";

interface PhoneFormData {
  phoneNumber: string;
}

const phoneForm = useForm<PhoneFormData>({
  resolver: zodResolver(phoneFormSchema),
  mode: "onChange",  // اعتبارسنجی در هر تغییر
});

// استفاده
<Input
  value={phoneWatchedValues.phoneNumber || ""}
  onChange={(e) => {
    const formatted = formatPhoneInput(e.target.value);
    phoneForm.setValue("phoneNumber", formatted, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }}
/>

// نمایش خطا
{phoneForm.formState.errors.phoneNumber && (
  <p className="text-destructive">
    {phoneForm.formState.errors.phoneNumber.message}
  </p>
)}
```

---

## 5. Type Safety

### 5.1 تعریف Request و Response Types

```typescript
// src/types/auth.types.ts
export interface SendOtpRequest {
  phoneNumber: string;
  captchaToken?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  hasProfile?: boolean;
  userId?: number;
  phoneNumber?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

// src/types/chat.types.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  chatMessageId?: number;
  requiresPayment?: boolean;
  paymentFailed?: boolean;
  canRetry?: boolean;
  hasPayment?: boolean;
  isPaid?: boolean;
  isCanceled?: boolean;
}

export interface ChatHistoryResponse {
  success: boolean;
  totalMessages: number;
  freeMessagesUsed: number;
  paidMessages: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  messages: ChatHistoryMessage[];
}

// src/types/payment.types.ts
export interface PaymentFeature {
  id: number;
  name: string;
  description: string;
  price: number;
  displayOrder: number;
}

export interface ChatPaymentRequestBody {
  chatMessageId?: number;
  question: string;
  callbackUrl: string;
  selectedFeatureIds: number[];
}

export interface ChatPaymentRequestResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}
```

### 5.2 Generic API Functions

```typescript
// src/lib/api.ts
export const sendDebateMessage = async (message: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  needsPayment?: boolean;
  basePrice?: number;
  chatMessageId?: number;
  features?: PaymentFeature[];
  isAnonymous?: boolean;
  anonymousLimitReached?: boolean;
}> => {
  // Implementation...
};

// src/lib/services/chat.service.ts
export interface ChatRequest {
  question: string;
  maxRounds: number;
}

export interface ChatResponse {
  question: string;
  debate_result: string;
  status: string;
}

class ChatService {
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post(API_ENDPOINTS.CHAT, data);
    return {
      question: response.data.question,
      debate_result: response.data.debate_result,
      status: response.data.status
    };
  }

  async getChatHistory(page: number = 1, pageSize?: number): Promise<ChatHistoryResponse> {
    const params: Record<string, number> = { page };
    if (pageSize !== undefined) {
      params.pageSize = pageSize;
    }
    const response = await api.get(API_ENDPOINTS.CHAT_HISTORY, { params });
    return response.data;
  }
}
```

### 5.3 JWT Payload Type

```typescript
// src/types/auth.types.ts
export interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  [key: string]: string | number | boolean | undefined;
}

// src/lib/utils/token.ts
export class JWTUtils {
  static decodeToken(token: string): JWTPayload | null {
    try {
      if (!token || typeof token !== "string") return null;

      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  static isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    return token.split(".").length === 3;
  }
}
```


---

## 6. Error Handling Strategy

### 6.1 مدیریت HTTP Status Codes

```typescript
// src/lib/api.ts - sendDebateMessage
catch (error: unknown) {
  const err = error as AxiosError;

  // Network Errors (``

`
  }
);or);eject(errromise.rn P retur  

   }
    }
    false;hing = isRefres       finally {
      } hError);
 refresreject(romise.eturn P      r;
  ef = '/chat'.location.hrwindow);
        learTokens(.cTokenManager
        , null);rrorhError as Eeue(refresocessQu pr{
       reshError) } catch (ref    );
  stinalReque(orig return api

       oken);ssTccell, a(nurocessQueue   p}`;
     accessToken `Bearer ${horization =eaders.Autst.hinalReque       orig);

 reshToken newRefccessToken,tTokens(aer.seTokenManag
        ponse.data;en } = resshToknewRefreoken: refreshTccessToken,    const { a);

             oken }
refreshT  {       ,
  KENREFRESH_TOS.AUTH.PI_ENDPOINT     A    
 hResponse>(post<Refresi.await apsponse =  re       const  try {
    }

      (error);
 ctjeomise.rePr     return hat';
   .href = '/cow.locationind    w;
    earTokens()er.clenManagTok        Token) {
if (!refresh   
   en();
oketRefreshTnager.genMaoken = TokeshT refrnst
      cotrue;
freshing = sRee;
      iry = trut._retiginalReques or    
 
  });
          });
  questinalReigori(return ap  `;
        rer ${token}ation = `Beas.AuthorizaderlRequest.he  origina      
  ) => {en((token}).th
        ject });e, resh({ resolvQueue.pu  failed        ect) => {
rejesolve, mise((rew Pro nreturn  ) {
      isRefreshingif (  ن
    ه صف اضافه کم، بfresh هستیگر در حال re      // ا{
      
ry) quest._ret!originalRest && que& originalRe &== 401tatus =.se?rror.respons (eد
    ifشده‌انکه retry نت‌هایی 1 و درخواسفقط برای 40

    //  };ean?: boolretryg & { _equestConfiAxiosRernalnfig as Intrror.coequest = et originalR  cons=> {
  iosError) c (error: Ax
  asynesponse,> rresponse) =  (.use(
ors.responseinterceptpi.ts
api.rc/lib/at
// scrip`typeseptor)

`` (در Intercn Refresh Toketomatic.4 Au``

### 7
`oken;
};urn t
  retl;
  }
nul return ));
   n-tampered"okent("tustomEve(new Cnt.dispatchEve
    windown();ecureToketeS
    deleetected");ampering d🚨 Token t("sole.warn    consh) {
 expectedHash !==ha if (h(token);
 teTokenHassh = generaedHaconst expect  rity
 بررسی integ
  //ll;
nuash) return  || !hen
  if (!tok");
hasn-h"auth-toketCookie(sh = ge const ha");
 tokenuth-e("aookitoken = getCt cons;

  urn null") retdefined "unf window ===eo  if (typl => {
nuling |  = (): strureTokentSec ge constrt
exporitytegرسی inبا برافت توکن  دری};

//);
lse, fafalsesh, days, h", hah-token-has("autkie
  setCoosh(token);okenHa = generateTt hash  consrity check
رای integره hash ب// ذخی

  alse); flse,, fan, daysoken", toke("auth-tsetCookieه توکن
  / ذخیر  /;

) returnd"ndefine= "u window == if (typeof 7) => {
  number =g, days:: strinkenen = (tocureToktSenst sert co
expoره توکن امن
// ذخی6);
};
tring(3sh).toSMath.abs(ha return }
 hash;
  h = hash & ar;
    hasash + ch - h< 5)= (hash <
    hash (i);.charCodeAtar = tokent ch cons  
 gth; i++) {oken.leni < t;  = 0et ifor (l
  0;sh = ha> {
  let g =in): strken: stringash = (toTokenHateconst generheck
 cgrity inteash برای h// تولیدokies.ts

/cotils// src/lib/upescript
t

```tynagemenCookie Maecure  S 7.3`

###``
}
}alse;
  urn f ret}
   d();
    kenExpire!this.isTo return en) {
     shTokreken && refccessTo
    if (ahToken();
esgetRefren = this.okfreshT   const resToken();
 cesAc = this.getssToken const acce   n {
ed(): booleauthenticat isAstaticیت
   هواحراز
  // بررسی }
  }

    ror);", ertokens:aring r cle"Erroog(.lnsole{
      co(error)  catch   }
    }
    ));cleared"n-"auth-tokeEvent(ew atchEvent(nisp    window.d") {
    efined !== "undeof window   if (typ

   shToken();fre  deleteReken();
    leteSecureTo dery {
     
    tid {s(): voclearToken  static ‌ها
همه توکنک کردن   // پا  }
  }

e;
  urn truret{
       (error) atch
    } cow;ad.exp < nturn paylo
      re0); / 100Date.now() Math.floor( now =nst

      cotrue;p) return load.ex|| !payyload if (!pa
      en);odeToken(toks.decJWTUtil= t payload ons c          }

rn false;
         retuoken)) {
t(tFormalidTokenls.isVaUti  if (!JWTود
    رض شقضی نشده ف منیست،ر توکن JWT ن  // اگ;

    ruereturn t) (!tokenf ();
      iokensTs.getAcces thin =onst toke     c    try {
  {
 booleaned():xpiric isTokenEوکن
  statضای ت بررسی انق }

  //  }
 l;
  eturn nul) {
      r (errorcatch;
    } ureToken()Seceturn get{
      r  try ll {
   nu(): string |kenessTotAccgey
  static  integritرسیoken با برaccess t // دریافت }
  }

 or);
    s:", errkening to"Error storlog(ole.     cons
  (error) {    } catch;
      }
"))n-updatedketh-to"au Event(chEvent(newindow.dispat   w") {
     efined !== "und window if (typeof     ش‌ها
 به سایر بخنی/ اطلاع‌رسا

      /
      });reshToken, 7shToken(ref    setRefre
    en) {Tokresh  if (ref
    en tokره refresh      // ذخی

7 روز, 7); // enccessTokureToken(aec   setS
   y checkntegritی ihash برا با en tokذخیره access    // ry {
  ng) {
    t: striefreshToken, r: stringsTokenokens(accesetT sticوکی
  staکن‌ها در کره تو// ذخی{
  er s TokenManagport clasn.ts
ex/tokeb/utils src/lit
//rippesc
```ty
anagementoken M 7.2 T

###─┘
```───────────────────────────────────────────────────────────────   │
└─                                                           │
│                         leared')  'token-cnt(tchEveindow.dispa6. w│         │
                                                ▼     │
│                                                               │   │
│             ore        and st Clear Zust -re.logout()eAuthSto │
│  5. us                                                              ▼          │
│                                                         ││
│          okies       Delete co- okens() arTager.clenManoke
│  4. T        │                                               ▼  │
│                                                                 │        │
│   -token  auth/revokepi/→ POST /avokeToken() rvice.re authSe   │
│  3.                                                  ▼         │
│                                                 │                   │
│                          ken) eAsync(ton.mutatokevokeTseRe │
│  2. u                                                                ▼   │
│                                                    │             │
│                                  ut      ogor clicks l│
│  1. Use                                                                
│  ─────┤──────────────────────────────────────────────────────────   │
├──                         T FLOW   GOU    LO                 ─┐
│   ────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────     │
└───                                                       │
│                       dated')     oken-uptchEvent('tw.dispa│  12. windo      │
                                                          ▼ │
│                                                  │          │
│                     uth'])    Queries(['atealidalient.invyCer│
│  11. qu                                                         ▼        
│        │                                                  │         │
│              storeustand  Zatein() - Updre.loguseAuthSto  │
│  10.                                                    ▼                    │
│                                                     │          │
│   )  reshTokenn, refTokes(accessokensetTager.. TokenMan
│  9    │                                                     ▼    
│          │                                                  │          │
│             }   efreshTokenken, rcessTons { acretur Backend   │
│  8.                                                ▼                   │
│                                                    │          │
│      -otp  verifyapi/auth/T /Otp() → POSifyhService.ver. aut
│  7        │                                                  ▼ │
│                                                                   │  │
│                mber, otp }){ phoneNuAsync(tateyOtp.mu6. useVerif
│       │                                                      ▼   
│            │                                                ││
│                                                      nters OTPUser e. 
│  5    │                                              ▼        
│             │                                              │       
│           │                              S with OTPnd sends SMcke
│  4. Ba    │                                                   ▼   │         │
                                               │              
│           │       th/loginpi/au→ POST /ap() Otce.sendServi. auth     │
│  3                                             ▼              
│     │                                                 │          │
│                    })   Number ({ phonetateAsynceSendOtp.mu│  2. us│
                                               ▼          
│              │                                                        │  
│    │                                  umber nenters phone User  │
│  1.                                                         │        ─┤
────────────────────────────────────────────────────────├────────      │
                 LOW         IN F      LOG                  ────┐
│─────────────────────────────────────────────────────────────`
┌

``lowgout F7.1 Login/Loow

### Flentication Auth--

## 7. 
-
}
```
  }    }

پیام'); در لغو  || 'خطاageesse?.data?.mresponsor(err.rrhrow new E     t 
    
  ;
      }رد') نداودم وجن پیاان لغو ایge || 'امکsa?.data?.mesr.responserror(erw new E thro  {
     = 400) tatus ==esponse?.srr.re if (e
      } els     };دارد' 
    ن شده یا وجوداً لغوم قبل: 'پیا  message
        e,ess: trucc  su
           return { 
     4) {=== 40atus ?.stonser.resp     if (erی شود
 ز تلقت‌آمیوفقیده - م قبلاً حذف ش پیام  // 404 = 
    ;
     sErrorType Axio = error asconst err) {
      : unknownorh (err catc
    }nse.data;n respo  retureId));
    hatMessagSSAGE(c_MES.CANCELI_ENDPOINTte(APapi.delese = await st respon    contry {
      tring }> {
: san; messagess: boole<{ succe): Promisenumber: atMessageIdessage(chelMcancsync rvice {
  aChatSe
class ervice.tsvices/chat.sb/serlisrc/ipt
// escr
```type
hat Servic CHandling در 6.4 Error ###
```


  }
}  };
    }",
    تاییدکد رسال "خطا در ا ge ||err.messaessage: 
        ms: false,     succesn {
     retur       }

   };
 ",
       ز استاز حد مجات بیش واسد درخage: "تعدا mess
         lse, fa success:{
         return   
       === 429) {nse?.statusrr.respof (ese i      } el     };

   ست",تبر اشده نامعارد  و"اطلاعاتge || sa.data?.mesrr.response?ge: e       messa false,
     success:
        turn {
        re400) {s === e?.statuerr.respons
      if (rorsTP status er// HT
         }
    };
   ",
     کنیدبررسینت خود را ال اینتر- لطفاً اتصور  سرتصال به در ا"خطاssage:    me
       ss: false,       succe  return {
 
         {"))k Error"Networs(age?.includeess || err.mROR""NETWORK_ERe ===  if (err.codrors
      Network er
      //e;
TyposErrorAxi= error as  const err  {
     wn) unknotch (error:   } ca
  }   ;
  ,
        } تایید"ل کد"خطا در ارساssage || .meta? response.dae:essag          m,
se: falccess       sun {
   etur      r
   else {};
      }e,
        | falshasProfile |a?.a?.datatponse.dofile: res      hasPr شد",
    ید ارسال || "کد تایssagemee.data?.age: respons  mess  ue,
      success: tr        {
     return
      ) {tus === 200nse.sta (respo      ifdata);

H.LOGIN, OINTS.AUTPI_ENDPi.post(A await ap response =      const    try {

ponse> {AuthRest): Promise<Reques: SendOtp(data sendOtp async
  {thServiceass Au.ts
clce.servi/authlib/servicesc/srcript
// pes```tyServices

ر r Handling د 6.3 Erro``

###
};
`ست', مجاز از حدبیش اتلاش تعداد EMPTS': 'OO_MANY_ATTست',
  'Tاشتباه ا تایید NVALID': 'کد
  'OTP_I',شده استد منقضی تاییED': 'کد EXPIRTP_cific
  'OAuth Spe/ 
  /,
  یست' در دسترس نتاً: 'سرویس موقست',
  503ر دسترس نی د- سرورخطای دروازه 
  502: 'د',کنیتلاش  دوباره طفاًی سرور - لطا0: 'خ
  50است', حد مجاز واست بیش ازتعداد درخ
  429: 'ر یافت نشد',ع مورد نظ 'منب',
  404: نیستش مجازسی به این بخ03: 'دسترشوید',
  4ارد وباره وطفاً د غیرمجاز - ل1: 'دسترسی40است',
  ت نامعتبر درخواس: 'es
  400tus CodSta// HTTP 
   کنید',
  تلاشاره ً دوبیست - لطفادسترس نرور در : 'سNNREFUSED'ید',
  'ECO کنود را بررسیاینترنت خصال - لطفاً ات سرور ر اتصال به': 'خطا دETWORK_ERROR
  'Nاش کنید',ً دوباره تلفاد - لطن رسیبه پایاتظار ان انORTED': 'زمNNAB
  'ECO Errors// Network
  {ring> = tring, st| sber : Record<numESAGt ERROR_MESSطاها
consل ترجمه خ
// جدوcript
```types
(فارسی)s essageor Mndly Errer-Frie## 6.2 Us
#
}
```

  } با سرور' };در ارتباطage || 'خطا rr.mess| e.message |ta?ponse?.daror: err.resalse, er success: fturn {   reefault:
     
    d };
  رس نیست' دستتاً دریس موقrror: 'سرو ee, falssuccess:   return { 
   :se 503  ca
    
  یست' }; دسترس ن سرور درطای دروازه - error: 'خlse,ess: fasuccrn { 
      retucase 502: 
      نید' };
  تلاش کً دوباره لطفاخطای سرور -se, error: ' falss:succen {   retur
    ase 500:    
    c
};ت' جاز اسش از حد مرخواست بی دror: 'تعداد: false, eresssucc {     return  case 429:
   
    شوید' };
 دوباره وارد اً  - لطفسی غیرمجازدستر, error: 'ess: falsern { succretu1:
       case 40;
    
    }    res || []
 tuableFeata?.availerrorDafeatures:       
  0,sageId || estM?.chad: errorDataessageI  chatM      ,
ceriData?.baseP errorice:      basePre,
  ment === trusPay.requirerorData?sPayment: er      needست',
  ر اامعتباست ندرخو '||or .errta?rDaerroe || ?.messagr: errorDatarro
        e: false,cess
        sucurn {;
      retse?.datar.respona = ernst errorDatco400:
      se ) {
    causate?.sterr.responstch (  swirs
us ErroStat HTTP 
  //
  }نید' };
 ک تلاشفاً دوباره سرور - لطردازش پاسخ در پor: 'خطاe, errccess: falsturn { su) {
    reJSON')?.includes('.message(err

  if 
  }' };ش کنید تلااً دوبارهست - لطفدر دسترس نیسرور error: 'e, uccess: fals { seturn')) {
    rREFUSEDludes('ECONNe?.incrr.messag || eCONNREFUSED'= 'Eerr.code ==if (;
  }

   کنید' }سیود را بررال اینترنت خً اتصفابه سرور - لطاتصال  'خطا در error:lse, s: fa succes  return {ror')) {
  'Network Er?.includes(message|| err.R' RRO_ETWORKode === 'NE  if (err.c  }

 کنید' };
تلاشه  دوبارفاًلط رسید - ر به پایانظا: 'زمان انت, error: falseccess return { su)) {
   ut'des('timeonclusage?.ierr.mesRTED' || ABONNode === 'ECOerr.cif (s)
  TP statuن HTبدو


---

## 8. مثال‌های عملی

### 8.1 CRUD کامل - Chat Messages

```typescript
// ========== CREATE - ارسال پیام جدید ==========
// src/lib/api.ts
export const sendDebateMessage = async (message: string): Promise<ChatMessageResponse> => {
  try {
    const isAuthenticated = !!TokenManager.getAccessToken();
    const endpoint = isAuthenticated 
      ? API_ENDPOINTS.CHAT.SEND_MESSAGE 
      : API_ENDPOINTS.CHAT.SEND_ANONYMOUS;

    const response = await api.post(endpoint, {
      question: message,
      maxRounds: 1
    }, {
      timeout: 900000,  // 15 minutes
    });

    if (response.status === 200) {
      if (typeof response.data === 'string') {
        return { success: true, message: response.data, isAnonymous: !isAuthenticated };
      }
      
      if (response.data.requiresPayment) {
        return {
          success: false,
          needsPayment: true,
          basePrice: response.data.basePrice,
          chatMessageId: response.data.chatMessageId,
          features: response.data.availableFeatures || [],
        };
      }
      
      return {
        success: true,
        message: response.data.debate_result || response.data.message
      };
    }
    
    return { success: false, error: 'خطا در دریافت پاسخ از سرور' };
  } catch (error) {
    // Error handling...
  }
};

// ========== READ - دریافت تاریخچه ==========
// src/lib/services/chat.service.ts
async getChatHistory(page: number = 1, pageSize?: number): Promise<ChatHistoryResponse> {
  const params: Record<string, number> = { page };
  if (pageSize !== undefined) {
    params.pageSize = pageSize;
  }
  
  const response = await api.get(API_ENDPOINTS.CHAT_HISTORY, { params });
  return response.data;
}

// ========== UPDATE - Retry پیام ==========
async retryMessage(chatMessageId: number): Promise<RetryResponse> {
  const response = await api.post(API_ENDPOINTS.RETRY_MESSAGE(chatMessageId));
  return response.data;
}

// ========== DELETE - لغو پیام ==========
async cancelMessage(chatMessageId: number): Promise<CancelResponse> {
  const response = await api.delete(API_ENDPOINTS.CANCEL_MESSAGE(chatMessageId));
  return response.data;
}
```

### 8.2 Pagination و Infinite Scroll

```typescript
// src/hooks/chat/useChatHistory.ts
export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 0,
    totalPages: 1,
    totalMessages: 0,
  });

  // بارگذاری صفحه اول
  const loadChatHistory = useCallback(async (page: number = 1, pageSize?: number) => {
    setIsLoading(true);
    try {
      const response = await chatService.getChatHistory(page, pageSize);
      if (response.success) {
        setChatHistory(response.messages);
        setPagination({
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          totalMessages: response.totalMessages,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // بارگذاری صفحات بعدی (Infinite Scroll)
  const loadMoreHistory = useCallback(async () => {
    if (pagination.currentPage >= pagination.totalPages || isLoading) return;

    setIsLoading(true);
    try {
      const response = await chatService.getChatHistory(
        pagination.currentPage + 1,
        pagination.pageSize
      );

      if (response.success) {
        // مرتب‌سازی پیام‌های جدید
        const sortedNewMessages = [...response.messages].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // اضافه کردن به ابتدای لیست (پیام‌های قدیمی‌تر)
        setChatHistory(prev => [...sortedNewMessages, ...prev]);
        
        setPagination(prev => ({
          ...prev,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [pagination, isLoading]);

  return { chatHistory, isLoading, pagination, loadChatHistory, loadMoreHistory };
};

// استفاده در کامپوننت با Intersection Observer
// src/components/chat/MessagesArea.tsx
useEffect(() => {
  if (!hasMoreMessages || !onLoadMore || !messagesContainerRef.current) return;

  const container = messagesContainerRef.current;

  const handleScroll = () => {
    const scrollTop = container.scrollTop;
    
    // بارگذاری بیشتر وقتی به 200px از بالا رسیدیم
    if (scrollTop < 200 && !isLoadingMore && hasMoreMessages) {
      onLoadMore();
    }
  };

  container.addEventListener('scroll', handleScroll, { passive: true });
  return () => container.removeEventListener('scroll', handleScroll);
}, [hasMoreMessages, onLoadMore, isLoadingMore]);
```

### 8.3 Payment Request

```typescript
// src/lib/services/payment.service.ts
import { api } from '@/lib/api';
import { ChatPaymentRequestBody, ChatPaymentRequestResponse } from '@/types';

export class ChatPaymentService {
  static async requestPayment(data: ChatPaymentRequestBody): Promise<ChatPaymentRequestResponse> {
    const res = await api.post('/api/chat/payment/request', data);
    return res.data;
  }
}

// استفاده در کامپوننت
const handlePayment = async () => {
  try {
    const response = await ChatPaymentService.requestPayment({
      chatMessageId: message.chatMessageId,
      question: message.content,
      callbackUrl: `${window.location.origin}/payment/result`,
      selectedFeatureIds: selectedFeatures.map(f => f.id),
    });

    if (response.success && response.paymentUrl) {
      // Redirect به درگاه پرداخت
      window.location.href = response.paymentUrl;
    } else {
      setError(response.message || 'خطا در ایجاد درخواست پرداخت');
    }
  } catch (error) {
    setError('خطا در ارتباط با سرور');
  }
};
```

### 8.4 Authentication Flow کامل

```typescript
// src/components/auth/AuthModal.tsx
export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpData, setOtpData] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
    mode: "onChange",
  });

  // Step 1: ارسال OTP
  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setError("");
    setPhoneNumber(data.phoneNumber);

    try {
      const response = await sendOtpMutation.mutateAsync({
        phoneNumber: data.phoneNumber,
      });

      if (response.success) {
        setStep("otp");
        setOtpCountdown(120);  // 2 minutes countdown
      } else {
        setError(response.message || "خطا در ارسال کد تایید");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    }
  };

  // Step 2: تایید OTP
  const handleOtpSubmit = async (otp: string) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        phoneNumber: phoneNumber,
        otp: otp,
      });

      if (response.success) {
        setError("");
        onSuccess();
        window.dispatchEvent(new CustomEvent("token-updated"));
      } else {
        setError(response.message || "کد تایید اشتباه است");
        setOtpData(["", "", "", "", "", ""]);  // Reset OTP
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تایید کد");
    }
  };

  // ارسال مجدد OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    
    setError("");
    try {
      const response = await sendOtpMutation.mutateAsync({
        phoneNumber: phoneNumber,
      });

      if (response.success) {
        setOtpCountdown(120);
        setOtpData(["", "", "", "", "", ""]);
      } else {
        setError(response.message || "خطا در ارسال مجدد کد");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    }
  };

  // Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  return (
    <Dialog open={isOpen}>
      {step === "phone" && (
        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
          <Input
            placeholder="شماره تماس"
            inputMode="numeric"
            {...phoneForm.register("phoneNumber")}
          />
          {error && <p className="text-destructive">{error}</p>}
          <Button type="submit" disabled={sendOtpMutation.isPending}>
            {sendOtpMutation.isPending ? "در حال ارسال..." : "دریافت کد"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <div>
          <OtpInput
            value={otpData}
            onChange={setOtpData}
            onComplete={handleOtpSubmit}
            disabled={verifyOtpMutation.isPending}
            error={error}
          />
          
          {otpCountdown > 0 ? (
            <p>ارسال مجدد کد در {otpCountdown} ثانیه</p>
          ) : (
            <Button onClick={handleResendOtp}>ارسال مجدد کد</Button>
          )}
        </div>
      )}
    </Dialog>
  );
}
```

### 8.5 Anonymous vs Authenticated Requests

```typescript
// src/lib/api.ts
export const sendDebateMessage = async (message: string) => {
  // تشخیص خودکار authenticated/anonymous
  const isAuthenticated = !!TokenManager.getAccessToken();
  
  const endpoint = isAuthenticated 
    ? API_ENDPOINTS.CHAT.SEND_MESSAGE      // /api/chat
    : API_ENDPOINTS.CHAT.SEND_ANONYMOUS;   // /api/chat/anonymous

  const response = await api.post(endpoint, {
    question: message,
    maxRounds: 1
  });

  return {
    success: true,
    message: response.data,
    isAnonymous: !isAuthenticated
  };
};
```

---

## 📝 خلاصه

این داکیومنت شامل تمام جنبه‌های یکپارچگی با API های بک‌اند در پروژه Fintellect است:

- **معماری API Layer**: ساختار Domain-based با تفکیک services
- **Axios Configuration**: Base instance با Request/Response interceptors
- **Token Refresh**: مکانیزم خودکار با queue برای درخواست‌های همزمان
- **React Query**: useMutation برای POST/PUT/DELETE با callbacks
- **Zod Validation**: Schema-based validation با Type inference
- **Error Handling**: مدیریت جامع HTTP status codes با پیام‌های فارسی
- **Authentication**: Login/Logout flow با secure cookie management
- **Next.js API Proxy**: برای حل مشکلات CORS

پروژه از الگوهای مدرن و best practices استفاده می‌کند و با Type Safety کامل طراحی شده است.
