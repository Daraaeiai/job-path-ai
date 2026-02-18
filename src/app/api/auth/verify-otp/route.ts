import { NextRequest, NextResponse } from "next/server";
import { phoneFormSchema } from "@/lib/validations/auth";
import { otpSchema } from "@/lib/validations/auth";
import { AuthService } from "@/server/services/auth.service";

const verifyBodySchema = phoneFormSchema.extend({
  otp: otpSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API] POST /api/auth/verify-otp request:", body);
    const parsed = verifyBodySchema.safeParse(body);
    if (!parsed.success) {
      console.log("[API] POST /api/auth/verify-otp validation failed");
      return NextResponse.json(
        { success: false, error: "شماره یا کد تایید معتبر نیست" },
        { status: 400 }
      );
    }
    const { success } = await AuthService.verifyOtp(
      parsed.data.phoneNumber,
      parsed.data.otp
    );
    const response = { success };
    console.log("[API] POST /api/auth/verify-otp response:", response);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
