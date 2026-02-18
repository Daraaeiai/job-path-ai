import { NextRequest, NextResponse } from "next/server";
import { registerFormSchema } from "@/lib/validations/auth";
import { AuthService } from "@/server/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API] POST /api/auth/register-send-otp request:", body);
    const parsed = registerFormSchema.safeParse(body);
    if (!parsed.success) {
      console.log("[API] POST /api/auth/register-send-otp validation failed");
      return NextResponse.json(
        { success: false, error: "ورودی معتبر نیست" },
        { status: 400 }
      );
    }
    const { success, otpSent } = await AuthService.registerAndSendOtp({
      phoneNumber: parsed.data.phoneNumber,
      fullName: parsed.data.fullName.trim(),
    });
    const response = { success, otpSent };
    console.log("[API] POST /api/auth/register-send-otp response:", response);
    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Unique constraint") || message.includes("unique")) {
      return NextResponse.json(
        { success: false, error: "این شماره قبلاً ثبت شده است" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
