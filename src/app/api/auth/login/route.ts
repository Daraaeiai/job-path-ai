import { NextRequest, NextResponse } from "next/server";
import { phoneFormSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = phoneFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "شماره تلفن معتبر نیست" },
        { status: 400 }
      );
    }
    // TODO: ارسال OTP واقعی (SMS provider)
    return NextResponse.json({ success: true, message: "کد ارسال شد" });
  } catch {
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
