"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits, toEnglishDigits } from "@/lib/utils";

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  onComplete?: (value: string) => void;
}

interface OTPCredentialRequestOptions extends CredentialRequestOptions {
  otp?: { transport: string[] };
}
interface OTPCredential extends Credential {
  code: string;
}

export function OTPInput({
  length,
  value,
  onChange,
  disabled = false,
  error = false,
  onComplete,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (!disabled) {
      const emptyIndex = value.length;
      if (emptyIndex < length && inputRefs.current[emptyIndex]) {
        inputRefs.current[emptyIndex]?.focus();
      }
    }
  }, [value, length, disabled]);

  useEffect(() => {
    if (value.length === length && onComplete && !isProcessingRef.current) {
      isProcessingRef.current = true;
      onComplete(value);
      const timer = setTimeout(() => {
        isProcessingRef.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [value, length, onComplete]);

  useEffect(() => {
    if (disabled || value.length === length) return;
    if (isProcessingRef.current) return;
    if (!("OTPCredential" in window)) return;

    abortControllerRef.current = new AbortController();
    const options: OTPCredentialRequestOptions = {
      otp: { transport: ["sms"] },
      signal: abortControllerRef.current.signal,
    };

    navigator.credentials
      .get(options)
      .then((credential) => {
        if (credential) {
          const otpCredential = credential as OTPCredential;
          const code = otpCredential.code;
          if (code) {
            const sanitized = toEnglishDigits(code).replace(/\D/g, "").slice(0, length);
            if (sanitized.length > 0) onChange(sanitized);
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.log("Web OTP API error:", err);
      });

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [disabled, length, onChange, value.length]);

  const handleChange = (index: number, digit: string) => {
    if (disabled || isProcessingRef.current) return;
    const english = toEnglishDigits(digit).replace(/\D/g, "");
    if (!english) return;

    const newValue = value.split("");
    newValue[index] = english[0];
    const result = newValue.join("").slice(0, length);
    onChange(result);

    if (index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");
      if (value[index]) {
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      inputRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const pasted = toEnglishDigits(e.clipboardData.getData("text/plain")).replace(/\D/g, "").slice(0, length);
    if (pasted) onChange(pasted);
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={toPersianDigits(value[index] ?? "")}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className={cn(
            "w-10 h-12 text-center text-xl font-bold rounded-2xl border border-stone-300 bg-transparent font-iranyekan transition-all outline-none",
            "text-zinc-800 placeholder:text-neutral-400",
            error
              ? "border-red-500 bg-red-50"
              : "focus:border-[#6F805C] focus:ring-1 focus:ring-[#6F805C]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`رقم ${index + 1}`}
        />
      ))}
    </div>
  );
}
