/**
 * ارسال پیامک از طریق سرویس RestFul لیمو اس ام اس (LimoSMS).
 * ارسال با متد پترن (الگو): https://api.limosms.com/api/sendpatternmessage
 * احراز هویت با ApiKey در هدر.
 */

const LIMOSMS_API_URL =
  process.env.LIMOSMS_API_URL ?? "https://api.limosms.com/api/sendpatternmessage";
const LIMOSMS_API_KEY = process.env.LIMOSMS_API_KEY ?? "";
const LIMOSMS_PATTERN_ID = Number(process.env.LIMOSMS_PATTERN_ID) || 1992;

export async function sendPatternMessage(
  mobileNumber: string,
  replaceTokens: string[]
): Promise<boolean> {
  if (!LIMOSMS_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[LimoSMS] LIMOSMS_API_KEY not set. Skipping send.");
      return true;
    }
    console.error("[LimoSMS] Missing LIMOSMS_API_KEY. SMS not sent.");
    return false;
  }

  const mobile = mobileNumber.replace(/\D/g, "");
  const body = {
    OtpId: LIMOSMS_PATTERN_ID,
    ReplaceToken: replaceTokens,
    MobileNumber: mobile.startsWith("0") ? mobile : `0${mobile}`,
  };

  const timeoutMs = 20_000;
  try {
    console.log("[LimoSMS] Request:", { url: LIMOSMS_API_URL, body });
    const res = await fetch(LIMOSMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: LIMOSMS_API_KEY,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => ({}));
    console.log("[LimoSMS] Response:", res.status, data);
    const success = (data as { Success?: boolean }).Success === true;
    if (!res.ok || !success) {
      console.error("[LimoSMS] Send failed:", res.status, (data as { Message?: string }).Message ?? data);
      return false;
    }
    return true;
  } catch (e) {
    const err = e as Error & { cause?: Error };
    console.error("[LimoSMS] Error:", err.message, err.cause ? String(err.cause) : "");
    return false;
  }
}

export function sendOtpSms(phone: string, code: string): Promise<boolean> {
  return sendPatternMessage(phone, [code]);
}
