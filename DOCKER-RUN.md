# راهنمای اجرای پروژه با Docker (دیتابیس + اپ)

این راهنما برای اجرای **هم دیتابیس و هم اپ** روی Docker است.

---

## پیش‌نیاز

- نصب [Docker](https://docs.docker.com/get-docker/)
- نصب [Docker Compose](https://docs.docker.com/compose/install/)

---

## مراحل اجرا

### ۱. بررسی فایل `.env`

مطمئن شو فایل `.env` در ریشه پروژه وجود دارد و این متغیرها را دارد:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/job_path_ai?schema=public"
JWT_SECRET="یک-رشته-حداقل-۳۲-کاراکتر"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
LIMOSMS_API_KEY=کد_دسترسی_لیمو
LIMOSMS_PATTERN_ID=1992
```

**نکته:** وقتی با `docker-compose` اجرا می‌کنی، `DATABASE_URL` خودکار روی `postgresql://postgres:postgres@db:5432/job_path_ai` تنظیم می‌شود (از طریق `environment` در `docker-compose.yml`).

---

### ۲. اجرای پروژه

در ریشه پروژه (همان جایی که `docker-compose.yml` است):

```bash
docker-compose up --build
```

- اولین بار: imageهای اپ و دیتابیس ساخته می‌شوند.
- با `--build` هر بار قبل از بالا آوردن، در صورت تغییر کد، اپ دوباره بیلد می‌شود.

**برای اجرا در پس‌زمینه:**

```bash
docker-compose up -d --build
```

---

### ۳. دسترسی

- **اپ:** [http://localhost:3000](http://localhost:3000)
- **PostgreSQL:** پورت `5432` روی همان ماشین (برای اتصال از بیرون داکر)

---

### ۴. متوقف کردن

```bash
docker-compose down
```

**برای حذف volume دیتابیس (تمام داده پاک می‌شود):**

```bash
docker-compose down -v
```

---

## سرویس‌ها

| سرویس | پورت | توضیحات |
|--------|------|---------|
| **app** | 3000 | Next.js اپلیکیشن |
| **db** | 5432 | PostgreSQL دیتابیس |

---

## لاگ‌ها

- **مشاهده لاگ اپ:**
  ```bash
  docker-compose logs -f app
  ```

- **مشاهده لاگ دیتابیس:**
  ```bash
  docker-compose logs -f db
  ```

- **مشاهده همه لاگ‌ها:**
  ```bash
  docker-compose logs -f
  ```

---

## مشکلات رایج

### اپ بالا نمی‌آید

- چک کن دیتابیس healthy است: `docker-compose ps`
- لاگ اپ را ببین: `docker-compose logs app`
- معمولاً مشکل از `DATABASE_URL` یا عدم آماده بودن دیتابیس است.

### دیتابیس بالا نمی‌آید

- چک کن پورت 5432 آزاد است: `netstat -an | grep 5432` (یا `lsof -i :5432`)
- اگر پورت اشغال است، در `docker-compose.yml` پورت دیتابیس را عوض کن (مثلاً `5433:5432`).

### اسکیما سینک نمی‌شود

- هنگام استارت اپ، `docker-entrypoint.sh` خودکار `prisma db push` را اجرا می‌کند.
- اگر خطا دیدی، دستی اجرا کن:
  ```bash
  docker-compose exec app npx prisma db push
  ```

---

## خلاصه دستورات

| کار | دستور |
|-----|--------|
| اجرا (با بیلد) | `docker-compose up --build` |
| اجرا در پس‌زمینه | `docker-compose up -d --build` |
| توقف | `docker-compose down` |
| توقف + حذف volume | `docker-compose down -v` |
| مشاهده وضعیت | `docker-compose ps` |
| لاگ اپ | `docker-compose logs -f app` |
| لاگ دیتابیس | `docker-compose logs -f db` |
| دسترسی به shell اپ | `docker-compose exec app sh` |
| دسترسی به shell دیتابیس | `docker-compose exec db psql -U postgres -d job_path_ai` |
