import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .min(1, "شماره تلفن الزامی است")
  .refine(
    (phone) => {
      const clean = phone.replace(/\D/g, "");
      return /^09\d{9}$/.test(clean);
    },
    "شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود"
  );

export const phoneFormSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const otpSchema = z
  .string()
  .length(6, "کد تایید باید ۶ رقم باشد")
  .regex(/^\d{6}$/, "فقط اعداد مجاز است");

export const otpFormSchema = z.object({
  otp: z
    .array(z.string().length(1, "هر خانه یک رقم"))
    .length(6, "کد تایید ۶ رقم"),
});

const fullNameSchema = z
  .string()
  .min(2, "حداقل ۲ کاراکتر")
  .max(100, "حداکثر ۱۰۰ کاراکتر")
  .regex(/^[\u0600-\u06FF\s]+$/, "فقط حروف فارسی");

export const registerFormSchema = z.object({
  phoneNumber: phoneNumberSchema,
  fullName: fullNameSchema,
});

export type PhoneFormData = z.infer<typeof phoneFormSchema>;
export type OtpFormData = z.infer<typeof otpFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
