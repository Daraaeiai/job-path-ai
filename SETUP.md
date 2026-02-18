# راهنمای اجرای پروژه روی سیستم جدید

برای ران کردن این پروژه روی یک سیستم دیگر این مراحل را انجام بده.

---

## ۱. کپی کردن پروژه

- پروژه را با **Git** کلون کن، یا پوشهٔ پروژه را کپی کن.
- **فایل `.env` را کپی نکن** (حاوی رمزهاست). روی سیستم جدید یک `.env` تازه می‌سازی.

---

## ۲. یکی از دو روش زیر را انتخاب کن

### روش الف: با داکر (ساده‌تر)

**پیش‌نیاز:** نصب [Docker](https://docs.docker.com/get-docker/) و Docker Compose.

1. در ریشه پروژه فایل **`.env`** بساز و حداقل این متغیرها را بگذار (مقادیر را با مقادیر خودت عوض کن):

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/job_path_ai?schema=public"
JWT_SECRET="یک-رشته-حداقل-۳۲-کاراکتر-تصادفی"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
LIMOSMS_API_KEY=کد_دسترسی_لیمو
LIMOSMS_PATTERN_ID=1992
```

2. اجرا:

```bash
npm install
docker-compose up --build
```

3. مرورگر: [http://localhost:3000](http://localhost:3000)

جزئیات بیشتر: [DOCKER.md](./DOCKER.md)

---

### روش ب: بدون داکر (Node + PostgreSQL جدا)

**پیش‌نیاز:** نصب **Node.js 20+** و **PostgreSQL**.

1. در ریشه پروژه فایل **`.env`** بساز:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/job_path_ai?schema=public"
JWT_SECRET="یک-رشته-حداقل-۳۲-کاراکتر-تصادفی"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
LIMOSMS_API_KEY=کد_دسترسی_لیمو
LIMOSMS_PATTERN_ID=1992
```

- `USER` و `PASSWORD` را با یوزر/پسورد PostgreSQL خودت عوض کن.
- اگر دیتابیس `job_path_ai` وجود ندارد، در PostgreSQL یک بار بسازش:  
  `CREATE DATABASE job_path_ai;`

2. نصب وابستگی‌ها و ساخت دیتابیس:

```bash
npm install
npx prisma generate
npx prisma db push
```

3. اجرای سرور توسعه:

```bash
npm run dev
```

4. مرورگر: [http://localhost:3000](http://localhost:3000)

برای **پروداکشن** بعد از تغییرات:

```bash
npm run build
npm start
```

---

## ۳. متغیرهای اختیاری

| متغیر | کاربرد |
|--------|--------|
| `NEXT_PUBLIC_MAUTIC_URL` | آدرس Mautic برای ردیابی (مثال: `https://mautic.yoursite.com`) |
| `LIMOSMS_API_URL` | در صورت نیاز به آدرس دیگر برای LimoSMS (پیش‌فرض در کد هست) |

اگر این‌ها را نگذاری، اپ بدون Mautic و با آدرس پیش‌فرض LimoSMS کار می‌کند.

---

## خلاصه برای سیستم جدید

| مرحله | کار |
|--------|-----|
| ۱ | کپی/کلون پروژه (بدون کپی `.env`) |
| ۲ | ساختن `.env` با مقادیر همان سیستم جدید |
| ۳ | `npm install` |
| ۴ | یا **داکر:** `docker-compose up --build` |
| ۵ | یا **بدون داکر:** دیتابیس را بساز، بعد `npx prisma db push` و `npm run dev` |

اگر خطایی دیدی، لاگ ترمینال و متن خطا را چک کن (معمولاً یا `.env` ناقص است یا دیتابیس در دسترس نیست).
