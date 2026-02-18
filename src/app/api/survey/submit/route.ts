import { NextRequest, NextResponse } from "next/server";
import { submitSurveySchema } from "@/lib/validations/survey";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = submitSurveySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "داده‌های ارسالی معتبر نیست" },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

    // TODO: ارسال به مدل AI و دریافت پیشنهاد شغلی
    // فعلاً یک پاسخ تستی برمی‌گردانیم
    const mockRecommendation = `مسیر پیشنهادی شما: Product Designer

بر اساس پاسخ‌های شما، مسیر Product Designer بیشترین هم‌خوانی را با سبک فکری، علایق و نحوه تصمیم‌گیری شما دارد. شما تمایل دارید هم خلاق باشید و هم منطقی فکر کنید؛ یعنی بتوانید ایده‌ها را به راه‌حل‌های قابل اجرا تبدیل کنید. این ویژگی یکی از مهم‌ترین پایه‌های طراحی محصول موفق است.

در این مسیر، شما معمولاً با چالش‌هایی روبه‌رو می‌شوید که نیازمند درک عمیق از کاربران، تحلیل رفتار آن‌ها و طراحی تجربه‌ای ساده و کاربردی است. پاسخ‌های شما نشان می‌دهد که از حل مسئله لذت می‌برید و ترجیح می‌دهید روی بهبود یک سیستم یا محصول اثر واقعی بگذارید، نه فقط انجام وظایف تکراری.

برای شروع و رشد در این مسیر، پیشنهاد می‌شود تمرکز خود را روی مهارت‌هایی مثل تفکر طراحی (Design Thinking)، طراحی تجربه کاربری (UX) و طراحی رابط کاربری (UI) بگذارید. آشنایی با ابزارهایی مثل Figma و کار با داده‌های رفتاری کاربران می‌تواند مسیر یادگیری شما را سریع‌تر و حرفه‌ای‌تر کند.

در نهایت، این مسیر به شما اجازه می‌دهد در محیط‌های استارتاپی یا تیم‌های محصول نقش کلیدی داشته باشید؛ جایی که تصمیم‌ها واقعاً اهمیت دارند و خلاقیت شما می‌تواند به شکل مستقیم روی موفقیت یک محصول تأثیر بگذارد.`;

    // شبیه‌سازی تاخیر API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      recommendation: mockRecommendation,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}
