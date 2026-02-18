import { db } from "@/server/db";

const OTP_EXPIRY_MINUTES = 5;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const OtpDAL = {
  async create(phoneNumber: string) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await db.otpCode.deleteMany({ where: { phoneNumber } });
    await db.otpCode.create({
      data: { phoneNumber, code, expiresAt },
    });
    return { code, expiresAt };
  },

  async findByPhoneAndCode(phoneNumber: string, code: string) {
    return await db.otpCode.findFirst({
      where: { phoneNumber, code },
      orderBy: { createdAt: "desc" },
    });
  },

  async deleteByPhone(phoneNumber: string) {
    return await db.otpCode.deleteMany({ where: { phoneNumber } });
  },
};
