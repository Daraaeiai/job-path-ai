import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ENGLISH_DIGITS = "0123456789";

export function toPersianDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => {
    const i = PERSIAN_DIGITS.indexOf(d);
    return i >= 0 ? ENGLISH_DIGITS[i] : d;
  });
}
