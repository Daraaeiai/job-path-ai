# راهنمای اجرای پروژه با npm run dev

برای اجرای پروژه در حالت توسعه (development) با `npm run dev`:

---

## روش ۱: دیتابیس روی داکر + اپ با npm

### ۱. فقط دیتابیس را با داکر بالا بیاور

```bash
docker-compose up db -d
```

این دستور فقط سرویس `db` (PostgreSQL) را اجرا می‌کند و در پس‌زمینه نگه می‌دارد.

### ۲. بررسی فایل `.env`

مطمئن شو `DATABASE_URL` در `.env` به پورت **۵۴۳۳** اشاره می‌کند (دیتابیس داکر روی ۵۴۳۳ است تا با PostgreSQL لوکال روی ۵۴۳۲ تداخل نداشته باشد):

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/job_path_ai?schema=public"
```

### ۳. نصب وابستگی‌ها و ساخت دیتابیس

```bash
npm install
npx prisma generate
npx prisma db push
```

### ۴. اجرای سرور توسعه

```bash
npm run dev
```

اپ روی **http://localhost:3000** در دسترس است.

---

## روش ۲: دیتابیس جدا (بدون داکر)

اگر PostgreSQL را جداگانه نصب کرده‌ای:

1. مطمئن شو PostgreSQL روی پورت `5432` در حال اجراست.
2. دیتابیس `job_path_ai` را بساز:
   ```sql
   CREATE DATABASE job_path_ai;
   ```
3. در `.env` آدرس و یوزر/پسورد دیتابیس خودت را بگذار:
   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/job_path_ai?schema=public"
   ```
4. سپس:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

---

## متوقف کردن

- **برای متوقف کردن دیتابیس (روش ۱):**
  ```bash
  docker-compose stop db
  ```
  یا برای حذف:
  ```bash
  docker-compose down
  ```

- **برای متوقف کردن اپ:** در ترمینال `Ctrl+C`

---

## خلاصه دستورات (روش ۱)

```bash
# ۱. فقط دیتابیس را بالا بیاور
docker-compose up db -d

# ۲. نصب وابستگی‌ها
npm install

# ۳. ساخت Prisma Client و سینک اسکیما
npx prisma generate
npx prisma db push

# ۴. اجرای اپ
npm run dev
```

---

## نکات

- **تغییرات کد:** با `npm run dev` تغییرات کد به‌صورت خودکار reload می‌شوند.
- **تغییرات اسکیما:** بعد از تغییر `prisma/schema.prisma` دوباره `npx prisma db push` را اجرا کن.
- **پورت 5433 اشغال است؟** در `docker-compose.yml` پورت دیتابیس را عوض کن (مثلاً `5434:5432`) و در `.env` مقدار `DATABASE_URL` را به همان پورت آپدیت کن.
