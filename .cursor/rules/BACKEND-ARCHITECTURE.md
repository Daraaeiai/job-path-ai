# 🏗️ راهنمای معماری بک‌اند و دیتابیس - Full-Stack

## فهرست مطالب

1. [ساختار فولدرینگ سرور](#1-ساختار-فولدرینگ-سرور)
2. [انتخاب و تنظیمات ORM (Prisma/Drizzle)](#2-انتخاب-و-تنظیمات-orm)
3. [الگوی Data Access Layer (DAL)](#3-الگوی-data-access-layer-dal)
4. [مدیریت Environment Variables](#4-مدیریت-environment-variables)
5. [Database Seeding & Migrations](#5-database-seeding--migrations)

---

## 1. ساختار فولدرینگ سرور

برای جداسازی منطق سرور از کلاینت و جلوگیری از نشت اطلاعات (Data Leak)، تمام کدهای مربوط به دیتابیس و لاجیک‌های حساس باید در دایرکتوری `src/server` قرار گیرند.

```
src/
├── server/
│   ├── db/                 # تنظیمات کلاینت دیتابیس (Prisma/Drizzle)
│   │   ├── index.ts        # Singleton instance
│   │   └── schema.ts       # (اگر از Drizzle استفاده می‌شود)
│   ├── dal/                # Data Access Layer (فقط کوئری‌های دیتابیس)
│   │   ├── user.dal.ts
│   │   ├── chat.dal.ts
│   │   └── payment.dal.ts
│   ├── services/           # Business Logic (ترکیب DAL و Validation)
│   │   ├── auth.service.ts
│   │   └── chat.service.ts
│   └── utils/              # ابزارهای کمکی سرور
│       ├── password.ts     # هش کردن پسورد
│       └── session.ts      # مدیریت Session سروری
│
├── app/
│   ├── api/                # Route Handlers (REST endpoints)
│   └── actions/            # Server Actions (توابع جهش داده برای کامپوننت‌ها)
```

---

## 2. انتخاب و تنظیمات ORM

پروژه از **Prisma** (یا Drizzle) به عنوان ORM استفاده می‌کند. ایجنت باید بداند که نباید کوئری‌های SQL خام بنویسد مگر در موارد خاص.

### 2.1 Prisma Setup (پیشنهادی)

```typescript
// src/server/db/index.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### 2.2 Schema Example (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  phoneNumber   String    @unique
  firstName     String?
  lastName      String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  chats         Chat[]
}

enum Role {
  USER
  ADMIN
}
```

---

## 3. الگوی Data Access Layer (DAL)

برای رعایت اصل Separation of Concerns، هیچگاه نباید `db.user.findMany` مستقیماً داخل Server Action یا API Route صدا زده شود. باید از لایه DAL استفاده شود.

### 3.1 ساختار فایل DAL

```typescript
// src/server/dal/user.dal.ts
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export const UserDAL = {
  async findByPhone(phoneNumber: string) {
    return await db.user.findUnique({
      where: { phoneNumber },
      select: { id: true, phoneNumber: true, role: true, firstName: true }, // Select specific fields for safety
    });
  },

  async createUser(data: Prisma.UserCreateInput) {
    return await db.user.create({
      data,
    });
  },

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string },
  ) {
    return await db.user.update({
      where: { id: userId },
      data,
    });
  },
};
```

### 3.2 استفاده از DTO (Data Transfer Objects)

تایپ‌های بازگشتی از DAL باید مشخص باشند تا اطلاعات حساسی مثل `passwordHash` ناخواسته به فرانت‌اند ارسال نشوند.

```typescript
// src/types/user.types.ts (Server-side)
export type UserProfileDTO = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN";
};
```

---

## 4. مدیریت Environment Variables

استفاده از `process.env` به صورت مستقیم توصیه نمی‌شود. از یک فایل اعتبارسنجی محیطی استفاده کنید.

```typescript
// src/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

export const ENV = env.data;
```

---

## 5. Best Practices

1.  **Strict Typing:** تمام ورودی‌ها و خروجی‌های دیتابیس باید تایپ شده باشند.
2.  **Connection Pooling:** در محیط Serverless (مانند Vercel)، مطمئن شوید که تنظیمات Connection Pool دیتابیس بهینه است.
3.  **Indexing:** برای فیلدهایی که در `where` یا `orderBy` استفاده می‌شوند (مثل `phoneNumber` یا `createdAt`) حتماً ایندکس تعریف کنید.
4.  **Soft Delete:** به جای حذف فیزیکی رکوردها، از فیلد `deletedAt` استفاده کنید.

````

---

### فایل ۲: راهنمای توسعه Server Actions و API Routes
نام پیشنهادی فایل: `server-actions-api.md`

```markdown
# 🔌 راهنمای توسعه Server Actions و API Routes

## فهرست مطالب

1. [Server Actions vs API Routes](#1-server-actions-vs-api-routes)
2. [استاندارد توسعه Server Actions](#2-استاندارد-توسعه-server-actions)
3. [استاندارد توسعه Route Handlers](#3-استاندارد-توسعه-route-handlers)
4. [Server-Side Validation (Zod)](#4-server-side-validation-zod)
5. [Authentication & Middleware](#5-authentication--middleware)

---

## 1. Server Actions vs API Routes

در Next.js App Router دو روش برای ارتباط با سرور وجود دارد:

| ویژگی | Server Actions | API Routes (Route Handlers) |
|-------|----------------|-----------------------------|
| **کاربرد اصلی** | Mutations (فرم‌ها، دکمه‌ها)، دریافت دیتا در کامپوننت سرور | Webhooks، Mobile App API، دسترسی عمومی (Public API) |
| **محل فایل** | `src/app/actions/*.ts` | `src/app/api/**/route.ts` |
| **نحوه فراخوانی** | مستقیم مثل تابع JS در کامپوننت | از طریق `fetch` یا `axios` |
| **امنیت** | نیاز به CSRF Protection داخلی دارد (Next.js انجام می‌دهد) | نیاز به مدیریت دستی CORS و Headers |

**قانون پروژه:** برای تمام تعاملات UI (مثل لاگین، چت، آپدیت پروفایل) از **Server Actions** استفاده کنید. برای Webhookهای پرداخت یا سرویس‌های شخص ثالث از **API Routes** استفاده کنید.

---

## 2. استاندارد توسعه Server Actions

برای مدیریت خطا و Type Safety در Server Actions، از الگوی زیر استفاده کنید.

### 2.1 Wrapper برای Server Actions

برای جلوگیری از تکرار `try/catch`، یک تابع کمکی ایجاد کنید:

```typescript
// src/server/utils/action-wrapper.ts
import { ZodSchema } from "zod";
import { getSession } from "./session"; // پیاده‌سازی فرضی session

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function authenticatedAction<Input, Output>(
  schema: ZodSchema<Input>,
  action: (data: Input, userId: string) => Promise<Output>,
  data: Input
): Promise<ActionResponse<Output>> {
  try {
    // 1. Validate Session
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate Input
    const validatedFields = schema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.message };
    }

    // 3. Execute Logic
    const result = await action(validatedFields.data, session.userId);
    return { success: true, data: result };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
````

### 2.2 مثال پیاده‌سازی یک Action

```typescript
// src/app/actions/chat.actions.ts
"use server";

import { authenticatedAction } from "@/server/utils/action-wrapper";
import { chatRequestSchema } from "@/lib/validations/chat"; // Shared validation
import { ChatService } from "@/server/services/chat.service";

export async function sendMessageAction(data: unknown) {
  return authenticatedAction(
    chatRequestSchema,
    async (validatedData, userId) => {
      // فراخوانی لایه سرویس
      const response = await ChatService.processMessage(
        userId,
        validatedData.message,
      );

      // Revalidate Path برای آپدیت UI
      // revalidatePath('/chat');

      return response;
    },
    data,
  );
}
```

---

## 3. استاندارد توسعه Route Handlers

زمانی که نیاز به یک Endpoint کلاسیک دارید (مثلاً `GET /api/users`).

```typescript
// src/app/api/webhook/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { ENV } from "@/env";

export async function POST(req: NextRequest) {
  try {
    // 1. Check Secret Header (Security)
    const signature = req.headers.get("x-payment-signature");
    if (signature !== ENV.PAYMENT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();

    // 3. Logic (Use Service Layer)
    await db.payment.update({
      where: { transactionId: body.id },
      data: { status: "SUCCESS" },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

---

## 4. Server-Side Validation (Zod)

نکته مهم: **Validations** باید بین کلاینت و سرور به اشتراک گذاشته شوند.
فایل‌های موجود در `src/lib/validations/*.ts` باید هم در `useForm` (کلاینت) و هم در `Server Actions` (سرور) ایمپورت شوند.

```typescript
// src/lib/validations/auth.ts
// این فایل در هر دو سمت استفاده می‌شود
export const loginSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/),
});
```

---

## 5. Authentication & Middleware

از آنجایی که پروژه از توکن‌های JWT (طبق داکیومنت فرانت‌اند) استفاده می‌کند، در حالت Full-Stack باید توکن‌ها را در **Cookie** (به صورت `HttpOnly`) ست کنید تا در Server Actions قابل دسترسی باشند.

### 5.1 Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // مسیرهای محافظت شده
  if (pathname.startsWith("/chat") || pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Note: اعتبارسنجی دقیق توکن بهتر است در Server Action یا Service Layer انجام شود
    // اینجا فقط وجود توکن چک می‌شود تا پرفورمنس بالا بماند.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/profile/:path*"],
};
```

### 5.2 تنظیم Cookie در لاگین (Server Side)

```typescript
// src/app/actions/auth.actions.ts
"use server";

import { cookies } from "next/headers";

export async function loginAction(phoneNumber: string) {
  // ... logic verify otp

  const cookieStore = await cookies();

  // Set Access Token
  cookieStore.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}
```

```

```
