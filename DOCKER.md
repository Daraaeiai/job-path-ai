# راهنمای اجرای پروژه با داکر

این پروژه با Docker و Docker Compose اجرا می‌شود و شامل دو سرویس است: **اپ (Next.js)** و **دیتابیس (PostgreSQL)**.

## پیش‌نیاز

- نصب [Docker](https://docs.docker.com/get-docker/)
- نصب [Docker Compose](https://docs.docker.com/compose/install/) (یا Docker Desktop که Compose را دارد)

## فایل `.env`

قبل از اولین اجرا مطمئن شوید فایل `.env` در ریشه پروژه وجود دارد. حداقل این متغیرها را داشته باشید (مقادیر داخل داکر با `docker-compose` تنظیم می‌شوند، ولی برای LimoSMS و غیره به `.env` نیاز دارید):

```env
# این مقدار در داکر با environment در docker-compose بازنویسی می‌شود
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/job_path_ai?schema=public"
JWT_SECRET="your-secret-at-least-32-chars"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
LIMOSMS_API_KEY="کد_دسترسی_شما"
LIMOSMS_PATTERN_ID=1992
```

**نکته:** وقتی با داکر اجرا می‌کنید، `DATABASE_URL` از طریق `docker-compose` روی آدرس سرویس `db` ست می‌شود؛ بقیه متغیرها از همین `.env` خوانده می‌شوند.

---

## هر بار که می‌خواهید پروژه را اجرا کنید

### ۱. بالا آوردن همه سرویس‌ها

در ریشه پروژه (همان جایی که `docker-compose.yml` است) اجرا کنید:

```bash
docker-compose up --build
```

- اولین بار تصویر اپ و دیتابیس ساخته و اجرا می‌شود.
- با `--build` هر بار قبل از بالا آوردن، در صورت تغییر کد، اپ دوباره بیلد می‌شود.

اگر خواستید در پس‌زمینه اجرا شود:

```bash
docker-compose up -d --build
```

### ۲. آدرس برنامه

- **اپ:** [http://localhost:3000](http://localhost:3000)
- **PostgreSQL:** پورت `5432` روی همان ماشین (برای اتصال از بیرون داکر، مثلاً با یک کلاینت دیتابیس)

### ۳. متوقف کردن

- اگر با `docker-compose up` (بدون `-d`) اجرا کرده‌اید: در همان ترمینال `Ctrl+C`.
- اگر با `-d` اجرا کرده‌اید:

```bash
docker-compose down
```

---

## فقط یک بار (اولین بار یا بعد از تغییر اسکیما)

- **سینک اسکیما با دیتابیس:** با بالا بودن سرویس‌ها، هنگام استارت اپ، اسکریپت `docker-entrypoint.sh` خودش `npx prisma db push` را اجرا می‌کند؛ پس معمولاً نیازی به دستور جداگانه نیست.

اگر خواستید دستی اسکیما را بزنید:

```bash
docker-compose run --rm app npx prisma db push
```

---

## خلاصه دستورات برای «هر دفعه ران شدن»

| کار                | دستور                          |
| ------------------ | ------------------------------ |
| اجرا (با بیلد)     | `docker-compose up --build`    |
| اجرا در پس‌زمینه   | `docker-compose up -d --build` |
| توقف               | `docker-compose down`          |
| مشاهده لاگ اپ      | `docker-compose logs -f app`   |
| مشاهده لاگ دیتابیس | `docker-compose logs -f db`    |

با این مراحل هر بار فقط با `docker-compose up --build` (یا `docker-compose up -d --build`) پروژه داکرایز شده را اجرا می‌کنید.
