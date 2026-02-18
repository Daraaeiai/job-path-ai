"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/data/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { cn, toPersianDigits, toEnglishDigits } from "@/lib/utils";
import Image from "next/image";
import { authService } from "@/lib/services/auth.service";

const phoneRegex = /^09\d{9}$/;
const otpRegex = /^\d{6}$/;
const persianNameRegex = /^[\u0600-\u06FF\s]*$/;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits.slice(0, 2);
  return digits.slice(0, 11);
}

export function LoginSection() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [needFullName, setNeedFullName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const phoneClean = phone.replace(/\D/g, "");
  const phoneValid = phoneRegex.test(phoneClean);
  const otpValid = otpRegex.test(otp);
  const fullNameTrimmed = fullName.trim();
  const nameValid =
    fullNameTrimmed.length >= 2 &&
    persianNameRegex.test(fullNameTrimmed);
  const canConfirmPhone = phoneValid && termsAccepted;
  const showOtpInput = phoneConfirmed;
  const canLogin = showOtpInput && otpValid;

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toEnglishDigits(e.target.value);
    setPhone(formatPhone(raw));
  }, []);

  const handleOtpChange = useCallback((value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  }, []);

  const handleConfirmPhone = useCallback(async () => {
    if (!canConfirmPhone) return;
    setError("");
    setLoading(true);
    try {
      const res = await authService.checkPhone(phoneClean);
      const data = res as { success?: boolean; exists?: boolean; error?: string };
      if (data?.success && data?.exists) {
        setPhoneConfirmed(true);
      } else if (data?.success && data?.exists === false) {
        setNeedFullName(true);
      } else {
        setError((data as { error?: string })?.error ?? "خطا در بررسی شماره");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [canConfirmPhone, phoneClean]);

  const handleSubmitNameAndSendOtp = useCallback(async () => {
    if (!nameValid || !phoneClean) return;
    setError("");
    setLoading(true);
    try {
      const res = await authService.registerAndSendOtp({
        phoneNumber: phoneClean,
        fullName: fullNameTrimmed,
      });
      const data = res as { success?: boolean; error?: string };
      if (data?.success) {
        setPhoneConfirmed(true);
        setNeedFullName(false);
      } else {
        setError(data?.error ?? "خطا در ثبت و ارسال کد");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [nameValid, phoneClean, fullNameTrimmed]);

  const handleVerifyAndLogin = useCallback(async (code?: string) => {
    const otpToVerify = code ?? otp;
    if (!otpToVerify || otpToVerify.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phoneClean, otpToVerify);
      const data = res as { success?: boolean; error?: string };
      if (data?.success) {
        router.push("/survey");
        return;
      }
      setError(data?.error ?? "کد تایید اشتباه یا منقضی است");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [phoneClean, otp, router]);

  return (
    <section className="relative w-full min-h-[100dvh] h-dvh overflow-hidden snap-start snap-always flex flex-col bg-stone-100">
      <div className="bg-white z-10 text-center w-full h-[30%] flex flex-col justify-center gap-2">
        <div className="flex w-full justify-center items-center">
          <Image src="/images/logo.svg" alt="logo" width={36} height={36} className="bg-stone-50" />
        </div>
        <div className="z-10 text-center">
          <h2
            className={cn(
              "text-zinc-800 text-2xl font-bold leading-9",
              "font-morabba"
            )}
          >
            {siteConfig.loginTitle}
          </h2>
        </div>
        <div className="text-center mt-2 px-12">
          <p className="text-neutral-500 text-xs font-medium leading-5 font-iranyekan">
            {siteConfig.loginDescription}
          </p>
        </div>
      </div>

      <div className="px-8 pt-6 flex flex-col gap-2">
        {!phoneConfirmed && (
          <>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-zinc-800 text-sm font-normal font-iranyekan"
              >
                {siteConfig.phoneLabel}
              </label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder={siteConfig.phonePlaceholder}
                value={toPersianDigits(phone)}
                onChange={handlePhoneChange}
                disabled={needFullName}
                className="text-right font-iranyekan"
                maxLength={11}
              />
              {phone.length > 0 && !phoneValid && (
                <p className="text-xs text-red-600 font-iranyekan">
                  شماره باید با ۰۹ شروع و ۱۱ رقم باشد
                </p>
              )}
            </div>

            <div className="px-2 pt-2 flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(!!v)}
                disabled={needFullName}
                className="shrink-0 outline-none"
              />
              <label
                htmlFor="terms"
                className="text-neutral-500 text-sm font-normal font-iranyekan text-right cursor-pointer"
              >

                {siteConfig.termsSuffix}
              </label>
            </div>
          </>
        )}

        {needFullName && !phoneConfirmed && (
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-zinc-800 text-sm font-normal font-iranyekan">
              {siteConfig.fullNameLabel}
            </label>
            <Input
              type="text"
              placeholder={siteConfig.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-right font-iranyekan"
            />
            {fullNameTrimmed.length > 0 && !nameValid && (
              <p className="text-xs text-red-600 font-iranyekan">
                نام و نام خانوادگی را وارد کنید (حداقل ۲ کاراکتر، فقط فارسی)
              </p>
            )}
          </div>
        )}

        {showOtpInput && (
          <div className="flex flex-col gap-2">
            <label className="text-zinc-800 text-sm font-normal font-iranyekan">
              {siteConfig.otpLabel}
            </label>
            <OTPInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={loading}
              error={!!error && otp.length === 6}
              onComplete={(code) => handleVerifyAndLogin(code)}
            />
            {otp.length > 0 && !otpValid && (
              <p className="text-xs text-red-600 font-iranyekan">
                کد تایید باید ۶ رقم باشد
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 font-iranyekan">{error}</p>
        )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-8 gap-3">
        {!phoneConfirmed ? (
          needFullName ? (
            <Button
              type="button"
              variant="secondary"
              disabled={!nameValid || loading}
              onClick={handleSubmitNameAndSendOtp}
              className="w-full rounded-[46px] font-iranyekan bg-linear-to-l from-[#8A9B77] to-[#6F805C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال ارسال..." : siteConfig.submitNameAndSendOtp}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={!canConfirmPhone || loading}
              onClick={handleConfirmPhone}
              className="w-full rounded-[46px] font-iranyekan bg-linear-to-l from-[#8A9B77] to-[#6F805C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال بررسی..." : "تایید شماره"}
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={!canLogin || loading}
            onClick={() => handleVerifyAndLogin()}
            className="w-full rounded-[46px] font-iranyekan bg-linear-to-l from-[#8A9B77] to-[#6F805C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال بررسی..." : siteConfig.loginButton}
          </Button>
        )}
      </div>
    </section>
  );
}
