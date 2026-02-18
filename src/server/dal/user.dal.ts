import { db } from "@/server/db";

export const UserDAL = {
  async findByPhone(phoneNumber: string) {
    return await db.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        role: true,
      },
    });
  },

  async create(data: { phoneNumber: string; fullName?: string }) {
    return await db.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        fullName: data.fullName,
      },
    });
  },
};
