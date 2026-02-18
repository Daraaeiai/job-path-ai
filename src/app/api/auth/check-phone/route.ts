import { NextRequest, NextResponse } from "next/server";
import { phoneFormSchema } from "@/lib/validations/auth";
import { AuthService } from "@/server/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API] POST /api/auth/check-phone request:", body);
    const parsed = phoneFormSchema.safeParse(body);
    if (!parsed.success) {
      console.log("[API] POST /api/auth/check-phone validation failed");
      return NextResponse.json(
        { success: false, error: "شماره تلفن معتبر نیست" },
        { status: 400 }
      );
    }
    const { exists, otpSent } = await AuthService.checkPhoneAndSendOtpIfExists(
      parsed.data.phoneNumber
    );
    const response = { success: true, exists, otpSent };
    console.log("[API] POST /api/auth/check-phone response:", response);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
