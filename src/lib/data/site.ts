export const siteConfig = {
  platformName: "Jobpath AI",
  heroTitle: "مسیر شغلی‌ات را هوشمندانه انتخاب کن",
  heroDescription:
    "                    Jobpath AI یک تصمیم‌یار هوشمند است که با چند سؤال کوتاه، بهت کمک می‌کند بهترین مسیر شغلی متناسب با توانایی‌ها، علایق و آینده‌ات را پیدا کنی.",
  ctaStart: "شروع مسیر شغلی من",
  howItWorksTitle: (name: string) => ` چطور "${name}" بهت کمک می‌کنه؟ `,
  howItWorksBullets: [
    "سبک کاری‌ات مشخص بشه",
    "توانمندی‌هات شناسایی بشه",
    "مسیرهای شغلی مناسب بهت پیشنهاد داده بشه",
  ],
  howItWorksNote:
    "❗️هیچ جواب درست یا غلطی وجود نداره، فقط خودِ واقعی‌ات باش.",
  loginTitle: "ورود به اکانت کاربری",
  loginDescription:
    "شماره موبایل و کد تایید را وارد کنید",
  loginButton: "ورود به اکانت کاربری",
  phoneLabel: "شماره موبایل",
  phonePlaceholder: "۰۹*********",
  otpLabel: "کد تایید",
  otpPlaceholder: "کد تایید را وارد کنید",
  termsSuffix: " شرایط و قوانین را پذیرفتم",
  fullNameLabel: "نام و نام خانوادگی",
  fullNamePlaceholder: "نام و نام خانوادگی",
  submitNameAndSendOtp: "تایید و ارسال کد",
} as const;
