# 📚 مستندات معماری پروژه Fintellect

## فهرست مطالب
1. [معماری کلی پروژه](#1-معماری-کلی-پروژه)
2. [ساختار فولدربندی](#2-ساختار-فولدربندی)
3. [تکنولوژی‌ها و ابزارها](#3-تکنولوژیها-و-ابزارها)
4. [معماری کامپوننت‌ها](#4-معماری-کامپوننتها)
5. [Routing و Navigation](#5-routing-و-navigation)
6. [Type Safety و Interfaces](#6-type-safety-و-interfaces)
7. [Best Practices و Patterns](#7-best-practices-و-patterns)

---

## 1. معماری کلی پروژه

### 1.1 الگوی معماری: Hybrid Layered + Feature-Based

پروژه Fintellect از یک معماری ترکیبی استفاده می‌کند:

#### Layered Architecture (لایه‌بندی افقی)
```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (Pages, Components, Page-Views)             │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│                (Hooks, Providers, Store)                 │
├─────────────────────────────────────────────────────────┤
│                     Service Layer                        │
│           (API Services, Utils, Validations)             │
├─────────────────────────────────────────────────────────┤
│                      Data Layer                          │
│              (Types, API Calls, Storage)                 │
└─────────────────────────────────────────────────────────┘
```

#### Feature-Based Organization (سازماندهی عمودی)
```
src/
├── components/
│   ├── auth/          # فیچر احراز هویت
│   ├── chat/          # فیچر چت
│   ├── payment/       # فیچر پرداخت
│   └── subscription/  # فیچر اشتراک
├── hooks/
│   ├── auth/          # هوک‌های احراز هویت
│   └── chat/          # هوک‌های چت
└── lib/services/
    ├── auth.service.ts
    ├── chat.service.ts
    └── payment.service.ts
```

### 1.2 جریان داده (Data Flow)

```
User Action → Component → Custom Hook → Service → API
                ↓
            Zustand Store (Client State)
                ↓
            React Query (Server State Cache)
                ↓
            UI Update
```

---

## 2. ساختار فولدربندی

### 2.1 نمای کلی ساختار

```
src/
├── app/                    # Next.js App Router
│   ├── api/proxy/         # پروکسی برای Backend
│   ├── chat/              # صفحه چت اصلی
│   ├── payment/result/    # نتیجه پرداخت
│   ├── terms/             # شرایط استفاده
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # صفحه اصلی (Redirect)
│   └── globals.css        # استایل‌های گلوبال
│
├── components/            # کامپوننت‌های React
│   ├── auth/             # کامپوننت‌های احراز هویت
│   ├── chat/             # کامپوننت‌های چت
│   ├── icons/            # آیکون‌های سفارشی
│   ├── payment/          # کامپوننت‌های پرداخت
│   ├── providers/        # Context Providers
│   ├── subscription/     # کامپوننت‌های اشتراک
│   ├── survey/           # کامپوننت‌های نظرسنجی
│   └── ui/               # کامپوننت‌های shadcn/ui
│
├── hooks/                 # Custom Hooks
│   ├── auth/             # هوک‌های احراز هویت
│   ├── chat/             # هوک‌های مدیریت چت
│   └── common/           # هوک‌های عمومی
│
├── lib/                   # کتابخانه‌ها و utilities
│   ├── data/             # داده‌های استاتیک
│   ├── services/         # سرویس‌های API
│   ├── utils/            # توابع کمکی
│   └── validations/      # اسکیماهای Zod
│
├── page-views/           # کامپوننت‌های سطح صفحه
│
├── store/                # Zustand Stores
│   ├── auth-store.ts     # مدیریت state احراز هویت
│   └── theme-store.ts    # مدیریت state تم
│
└── types/                # TypeScript Types
    ├── index.ts          # تایپ‌های عمومی
    ├── auth.types.ts     # تایپ‌های احراز هویت
    ├── chat.types.ts     # تایپ‌های چت
    └── payment.types.ts  # تایپ‌های پرداخت
```

### 2.2 نقش و مسئولیت هر فولدر

| فولدر | مسئولیت | مثال فایل |
|-------|---------|-----------|
| `app/` | صفحات و routing | `page.tsx`, `layout.tsx` |
| `components/` | کامپوننت‌های قابل استفاده مجدد | `ChatInput.tsx` |
| `hooks/` | منطق قابل استفاده مجدد | `useChatManager.ts` |
| `lib/services/` | ارتباط با API | `auth.service.ts` |
| `store/` | مدیریت state گلوبال | `auth-store.ts` |
| `types/` | تعریف تایپ‌ها | `chat.types.ts` |

### 2.3 کانونشن‌های نام‌گذاری

```typescript
// کامپوننت‌ها: PascalCase
ChatInput.tsx, LoginModal.tsx

// هوک‌ها: camelCase با پیشوند use
useAuth.ts, useChatManager.ts

// سرویس‌ها: kebab-case با پسوند .service
auth.service.ts, chat.service.ts

// تایپ‌ها: kebab-case با پسوند .types
auth.types.ts, chat.types.ts

// استورها: kebab-case با پسوند -store
auth-store.ts, theme-store.ts
```

---

## 3. تکنولوژی‌ها و ابزارها

### 3.1 Core Framework

| تکنولوژی | نسخه | کاربرد |
|----------|------|--------|
| Next.js | 15.5.6 | فریمورک React با App Router |
| React | 18.x | کتابخانه UI |
| TypeScript | 5.x | Type Safety |

### 3.2 Styling

| تکنولوژی | نسخه | کاربرد |
|----------|------|--------|
| Tailwind CSS | 3.3.0 | Utility-first CSS |
| tailwindcss-animate | 1.0.7 | انیمیشن‌ها |
| class-variance-authority | 0.7.0 | مدیریت variants |
| tailwind-merge | 2.2.1 | ادغام کلاس‌ها |

### 3.3 UI Components

| تکنولوژی | کاربرد |
|----------|--------|
| shadcn/ui | کامپوننت‌های پایه |
| Radix UI | کامپوننت‌های headless |
| Lucide React | آیکون‌ها |
| Framer Motion | انیمیشن‌های پیشرفته |

### 3.4 State Management

| تکنولوژی | نسخه | کاربرد |
|----------|------|--------|
| Zustand | 5.0.8 | Client State |
| TanStack React Query | 5.90.3 | Server State |

### 3.5 Form & Validation

| تکنولوژی | نسخه | کاربرد |
|----------|------|--------|
| React Hook Form | 7.49.3 | مدیریت فرم |
| Zod | 3.22.4 | اعتبارسنجی |
| @hookform/resolvers | 3.3.4 | اتصال Zod به RHF |

### 3.6 HTTP & API

| تکنولوژی | نسخه | کاربرد |
|----------|------|--------|
| Axios | 1.12.2 | HTTP Client |

### 3.7 فونت‌های فارسی

```typescript
// src/app/layout.tsx
const vazir = localFont({
  src: [
    { path: "../../public/fonts/vazir/Vazir-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/vazir/Vazir-Bold.ttf", weight: "700" },
  ],
  variable: "--font-vazir",
});

const morabba = localFont({
  src: [
    { path: "../../public/fonts/morabba/Morabba-Regular.ttf", weight: "400" },
  ],
  variable: "--font-morabba",
});
```

### 3.8 تنظیمات Tailwind

```typescript
// tailwind.config.ts
const config = {
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-vazir)", "system-ui", "sans-serif"],
        morabba: ["var(--font-morabba)", "var(--font-vazir)"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```


---

## 4. معماری کامپوننت‌ها

### 4.1 تفکیک Container و Presentational

#### Container Components (Smart)
مسئول منطق و state:

```typescript
// مثال: کامپوننت مدیریت چت
export const ChatPageView = () => {
  const { messages, addMessage, createNewChat } = useChatManager();
  const { isAuthenticated } = useAuthStore();
  
  const handleSendMessage = async (content: string) => {
    // منطق ارسال پیام
  };
  
  return (
    <ChatLayout>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSendMessage} />
    </ChatLayout>
  );
};
```

#### Presentational Components (Dumb)
فقط نمایش UI:

```typescript
interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const MessageBubble = ({ content, role, timestamp }: MessageBubbleProps) => {
  return (
    <div className={cn(
      "rounded-lg p-4",
      role === 'user' ? "bg-primary" : "bg-muted"
    )}>
      <p>{content}</p>
      <span className="text-xs">{formatTime(timestamp)}</span>
    </div>
  );
};
```

### 4.2 Custom Hooks Pattern

```typescript
// src/hooks/chat/useChatManager.ts
export const useChatManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
      if (savedSessions) {
        setChatSessions(JSON.parse(savedSessions));
      }
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    return newChatId;
  }, []);

  return { messages, chatSessions, currentChatId, addMessage, createNewChat };
};
```

### 4.3 Provider Pattern

```typescript
// src/components/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
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

### 4.4 ساختار Providers در Layout

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ThemeInitializer />
        <AuthInitializer>
          <TokenSecurityProvider>
            <QueryProvider>{children}</QueryProvider>
          </TokenSecurityProvider>
        </AuthInitializer>
      </body>
    </html>
  );
}
```


---

## 5. Routing و Navigation

### 5.1 ساختار Route‌ها

```
/                    → Redirect به /chat
/chat               → صفحه اصلی چت‌بات
/payment/result     → نتیجه پرداخت
/terms              → شرایط و قوانین
/api/proxy/*        → API Proxy به Backend
```

### 5.2 صفحه اصلی (Redirect)

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/chat");
}
```

### 5.3 Layout Structure

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${morabba.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const stored = localStorage.getItem('theme-storage');
              const theme = stored ? JSON.parse(stored).state?.theme : 'dark';
              document.documentElement.classList.add(theme || 'dark');
            } catch (e) {
              document.documentElement.classList.add('dark');
            }
          `,
        }} />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeInitializer />
        <AuthInitializer>
          <TokenSecurityProvider>
            <QueryProvider>{children}</QueryProvider>
          </TokenSecurityProvider>
        </AuthInitializer>
      </body>
    </html>
  );
}
```

### 5.4 Authentication Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Opens    │────▶│  Check Auth      │────▶│  Show Chat      │
│   /chat         │     │  (Zustand Store) │     │  (Authenticated)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               │ Not Authenticated
                               ▼
                        ┌──────────────────┐
                        │  Show Login      │
                        │  Modal           │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  OTP Verify      │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Store Tokens    │
                        │  (Zustand+Local) │
                        └──────────────────┘
```


---

## 6. Type Safety و Interfaces

### 6.1 سازماندهی Types

```
src/types/
├── index.ts          # تایپ‌های عمومی و re-exports
├── auth.types.ts     # تایپ‌های احراز هویت
├── chat.types.ts     # تایپ‌های چت
└── payment.types.ts  # تایپ‌های پرداخت
```

### 6.2 مثال تایپ‌های چت

```typescript
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

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
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
```

### 6.3 مثال تایپ‌های Store

```typescript
// src/store/auth-store.ts
interface User {
  phoneNumber: string;
  userId?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  login: (...) => void;
  logout: () => void;
  setTokens: (...) => void;
  isTokenValid: () => boolean;
}
```

### 6.4 API Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```


---

## 7. Best Practices و Patterns

### 7.1 State Management با Zustand

```typescript
// src/store/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: (phoneNumber, accessToken, refreshToken, userId) => {
        set({
          isAuthenticated: true,
          user: { phoneNumber, userId },
          accessToken,
          refreshToken,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
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
    },
  ),
);
```

### 7.2 Token Refresh با Axios Interceptors

```typescript
// src/lib/api.ts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/api/auth/refresh-token', {
          refreshToken: TokenManager.getRefreshToken(),
        });
        const { accessToken, refreshToken } = response.data;
        TokenManager.setTokens(accessToken, refreshToken);
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        TokenManager.clearTokens();
        window.location.href = '/chat';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

### 7.3 Service Layer Pattern

```typescript
// src/lib/services/auth.service.ts
export const AuthService = {
  login: async (phoneNumber: string) => {
    const response = await api.post('/api/auth/login', { phoneNumber });
    return response.data;
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    const response = await api.post('/api/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  },

  logout: async () => {
    await api.post('/api/auth/revoke-token');
  },
};
```

### 7.4 Error Handling Strategy

```typescript
export const sendDebateMessage = async (message: string) => {
  try {
    const response = await api.post(endpoint, { question: message });
    if (response.status === 200) {
      return { success: true, message: response.data };
    }
    return { success: false, error: 'خطا در دریافت پاسخ' };
  } catch (error) {
    const err = error as AxiosError;
    
    // Network errors
    if (err.code === 'ECONNABORTED') {
      return { success: false, error: 'زمان انتظار به پایان رسید' };
    }
    if (err.code === 'NETWORK_ERROR') {
      return { success: false, error: 'خطا در اتصال به سرور' };
    }
    
    // HTTP status errors
    if (err.response?.status === 401) {
      return { success: false, error: 'دسترسی غیرمجاز' };
    }
    if (err.response?.status === 429) {
      return { success: false, error: 'تعداد درخواست بیش از حد مجاز' };
    }
    
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
};
```

### 7.5 RTL Support

```typescript
// src/app/layout.tsx
<html lang="fa" dir="rtl">
```

### 7.6 Clean Code Principles

1. **Single Responsibility**: هر فایل یک مسئولیت مشخص دارد
2. **DRY**: استفاده از Custom Hooks برای منطق تکراری
3. **Separation of Concerns**: جداسازی UI، منطق و داده
4. **Type Safety**: استفاده کامل از TypeScript
5. **Consistent Naming**: کانونشن‌های نام‌گذاری یکسان

---

## 📝 خلاصه

پروژه Fintellect یک اپلیکیشن چت‌بات مدرن با معماری تمیز و قابل نگهداری است که از:

- **Next.js 15** با App Router برای routing و SSR
- **Zustand** برای client state و **React Query** برای server state
- **TypeScript** برای type safety کامل
- **Tailwind CSS** و **shadcn/ui** برای styling
- **Service Layer Pattern** برای ارتباط با API
- **Custom Hooks** برای جداسازی منطق از UI

استفاده می‌کند و با پشتیبانی کامل از زبان فارسی (RTL) و تم تاریک/روشن طراحی شده است.
