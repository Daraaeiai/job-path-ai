export const FALLBACK_SURVEY_QUESTIONS = [
  {
    id: "q1",
    text: "بیشتر دوست داری چطور کار کنی؟",
    order: 1,
    options: [
      { id: "q1-o1", text: "به‌صورت مستقل و آزاد", value: "independent", emoji: "🧍‍♂️" },
      { id: "q1-o2", text: "در یک تیم پویا", value: "team", emoji: "👥" },
      { id: "q1-o3", text: "ترکیبی از هر دو", value: "both", emoji: "🔀" },
      { id: "q1-o4", text: "هنوز مطمئن نیستم", value: "unsure", emoji: "❓" },
    ],
  },
  {
    id: "q2",
    text: "بیشتر به کدوم فعالیت علاقه داری؟",
    order: 2,
    options: [
      { id: "q2-o1", text: "کار با تکنولوژی و ابزار دیجیتال", value: "tech", emoji: "💻" },
      { id: "q2-o2", text: "تولید محتوا و ایده", value: "content", emoji: "✍" },
      { id: "q2-o3", text: "تحلیل داده و برنامه‌ریزی", value: "data", emoji: "📊" },
      { id: "q2-o4", text: "ارتباط با آدم‌ها", value: "people", emoji: "🤝" },
    ],
  },
  {
    id: "q3",
    text: "ترجیح میدی محیط کارت چطور باشه؟",
    order: 3,
    options: [
      { id: "q3-o1", text: "اداری و ساختارمند", value: "office", emoji: "🏢" },
      { id: "q3-o2", text: "از راه دور و انعطاف‌پذیر", value: "remote", emoji: "🏠" },
      { id: "q3-o3", text: "پروژه‌ای و مهلت‌محور", value: "project", emoji: "📋" },
      { id: "q3-o4", text: "خلاق و بدون قید", value: "creative", emoji: "🎨" },
    ],
  },
  {
    id: "q4",
    text: "کدوم نوع چالش برات جذاب‌تره؟",
    order: 4,
    options: [
      { id: "q4-o1", text: "حل مسئله فنی", value: "technical", emoji: "🔧" },
      { id: "q4-o2", text: "کار تیمی و هماهنگی", value: "collab", emoji: "🤲" },
      { id: "q4-o3", text: "تحقیق و یادگیری", value: "research", emoji: "📚" },
      { id: "q4-o4", text: "فروش و مذاکره", value: "sales", emoji: "💬" },
    ],
  },
  {
    id: "q5",
    text: "در مواجهه با مهلت سخت چیکار می‌کنی؟",
    order: 5,
    options: [
      { id: "q5-o1", text: "برنامه می‌ریزم و مرحله‌به‌مرحله پیش میرم", value: "plan", emoji: "📝" },
      { id: "q5-o2", text: "همه‌چیز رو اولویت‌بندی می‌کنم", value: "priority", emoji: "📌" },
      { id: "q5-o3", text: "با تیم تقسیم کار می‌کنم", value: "delegate", emoji: "👐" },
      { id: "q5-o4", text: "تحت فشار بهتر کار می‌کنم", value: "pressure", emoji: "⚡" },
    ],
  },
  {
    id: "q6",
    text: "دوست داری نتیجه کارت چطور دیده بشه؟",
    order: 6,
    options: [
      { id: "q6-o1", text: "مستقیم و قابل اندازه‌گیری", value: "measurable", emoji: "📈" },
      { id: "q6-o2", text: "در قالب ایده و اثر روی دیگران", value: "impact", emoji: "💡" },
      { id: "q6-o3", text: "به‌صورت تیمی و مشترک", value: "shared", emoji: "🤝" },
      { id: "q6-o4", text: "به نام خودم و شخصی", value: "personal", emoji: "✨" },
    ],
  },
  {
    id: "q7",
    text: "چقدر به یادگیری چیزهای جدید علاقه داری؟",
    order: 7,
    options: [
      { id: "q7-o1", text: "خیلی زیاد، همیشه در حال یادگیریم", value: "high", emoji: "🚀" },
      { id: "q7-o2", text: "در حد نیاز شغلم", value: "medium", emoji: "📖" },
      { id: "q7-o3", text: "ترجیح میدم روی یک حوزه عمیق بشم", value: "depth", emoji: "🎯" },
      { id: "q7-o4", text: "بستگی به موضوع داره", value: "depends", emoji: "🔄" },
    ],
  },
  {
    id: "q8",
    text: "ترجیح میدی درآمدت چطور باشه؟",
    order: 8,
    options: [
      { id: "q8-o1", text: "ثابت و قابل پیش‌بینی", value: "fixed", emoji: "💰" },
      { id: "q8-o2", text: "وابسته به عملکرد و کمیسیون", value: "variable", emoji: "📊" },
      { id: "q8-o3", text: "ترکیبی از هر دو", value: "mixed", emoji: "🔀" },
      { id: "q8-o4", text: "فعلا مهم نیست، تجربه مهم‌تره", value: "experience", emoji: "🌱" },
    ],
  },
] as const;
