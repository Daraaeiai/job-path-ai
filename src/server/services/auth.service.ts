import { UserDAL } from "@/server/dal/user.dal";
import { OtpDAL } from "@/server/dal/otp.dal";
import { sendOtpSms } from "@/server/services/sms.service";

export const AuthService = {
  async findByPhone(phoneNumber: string) {
    return UserDAL.findByPhone(phoneNumber);
  },

  async createUser(data: { phoneNumber: string; fullName?: string }) {
    return UserDAL.create(data);
  },

  /** برمی‌گرداند کاربر با این شماره وجود دارد یا نه؛ در صورت وجود OTP می‌سازد و پیامک می‌فرستد */
  async checkPhoneAndSendOtpIfExists(phoneNumber: string): Promise<{ exists: boolean; otpSent?: boolean }> {
    const user = await UserDAL.findByPhone(phoneNumber);
    if (!user) return { exists: false };
    const { code } = await OtpDAL.create(phoneNumber);
    const sent = await sendOtpSms(phoneNumber, code);
    return { exists: true, otpSent: sent };
  },

  /** کاربر جدید: ثبت نام + ارسال OTP */
  async registerAndSendOtp(data: {
    phoneNumber: string;
    fullName: string;
  }): Promise<{ success: boolean; otpSent?: boolean }> {
    await UserDAL.create({
      phoneNumber: data.phoneNumber,
      fullName: data.fullName,
    });
    const { code } = await OtpDAL.create(data.phoneNumber);
    const sent = await sendOtpSms(data.phoneNumber, code);
    return { success: true, otpSent: sent };
  },

  /** تایید OTP و در صورت موفقیت حذف کد */
  async verifyOtp(phoneNumber: string, code: string): Promise<{ success: boolean }> {
    const row = await OtpDAL.findByPhoneAndCode(phoneNumber, code);
    if (!row) return { success: false };
    if (new Date() > row.expiresAt) {
      await OtpDAL.deleteByPhone(phoneNumber);
      return { success: false };
    }
    await OtpDAL.deleteByPhone(phoneNumber);
    return { success: true };
  },
};
