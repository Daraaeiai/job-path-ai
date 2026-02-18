# راهنمای PostHog در پروژه

ردیابی رفتار کاربر (صفحه‌ها، کلیک‌ها و ایونت‌های سفارشی) با [PostHog](https://posthog.com) انجام می‌شود.

## تنظیمات فعلی

- **پکیج:** `posthog-js` (نصب با `npm install`)
- **مقداردهی:** در `src/instrumentation-client.ts` (طبق doc رسمی PostHog برای Next.js 15.3+)
- **متغیرهای env:**
  - `NEXT_PUBLIC_POSTHOG_KEY` – کلید API پروژه
  - `NEXT_PUBLIC_POSTHOG_HOST` – آدرس PostHog (مثلاً `https://us.i.posthog.com` یا `http://localhost` برای self-hosted)

اگر این دو متغیر در `.env` ست باشند، PostHog روی کلاینت init می‌شود و به‌صورت خودکار **pageview** و تعاملات را ثبت می‌کند.

## ارسال ایونت سفارشی

در هر کامپوننت کلاینت:

```tsx
'use client'
import posthog from 'posthog-js'

export default function MyComponent() {
  const handleAction = () => {
    posthog.capture('my_event', { prop: 'value' })
  }
  return <button onClick={handleAction}>کلیک</button>
}
```

## پروداکشن

در محیط پروداکشن حتماً `NEXT_PUBLIC_POSTHOG_HOST` را به آدرس نهایی PostHog (مثلاً `https://us.i.posthog.com`) تنظیم کنید.
