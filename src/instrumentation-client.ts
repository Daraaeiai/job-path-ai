/**
 * PostHog – مقداردهی اولیه روی کلاینت (طبق doc رسمی PostHog برای Next.js 15.3+).
 * با این فایل، pageview و تعاملات به‌صورت خودکار ثبت می‌شوند.
 */
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && key && host) {
  posthog.init(key, {
    api_host: host,
    defaults: "2026-01-30",
  });
}
