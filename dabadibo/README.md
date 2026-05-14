# دباديبو (Dabadibo)

متجر هدايا بالعربية — واجهة **React + Tailwind**، خادم **Node.js + Express**، قاعدة **PostgreSQL**.

## تشغيل المشروع بالترتيب

إذا ظهر خطأ شهادات SSL أثناء `npm install` على Windows، جرّب في PowerShell قبل الأمر:

`$env:NODE_OPTIONS="--use-system-ca"`

### 1) إنشاء قاعدة البيانات

```bash
createdb dabadibo
```

أو من داخل `psql`:

```sql
CREATE DATABASE dabadibo;
```

### 2) تشغيل الملف `schema.sql`

من جذر المشروع `dabadibo/` (عدّل المستخدم وكلمة المرور حسب إعدادك):

```bash
psql "postgresql://user:password@localhost:5432/dabadibo" -f server/db/schema.sql
```

### 3) إعداد المتغيرات

انسخ `.env.example` إلى **`dabadibo/.env`** (موصى به)، أو إلى `dabadibo/server/.env`. عند تشغيل `npm start` من مجلد `server/`، يقرأ التطبيق تلقائياً `dabadibo/.env` حتى لا يُفقد `DATABASE_URL` (بدون ذلك قد يحاول PostgreSQL الاتصال باسم مستخدم ويندوز ويظهر خطأ مثل `role "jimmy" does not exist`).

عدّل `DATABASE_URL` و`JWT_SECRET` لتطابق إعدادك.

للواجهة: انسخ السطر `VITE_API_URL` إلى ملف `client/.env` إن لزم، أو استخدم القيمة الافتراضية `http://localhost:5000`.

### 4) تثبيت الحزم

```bash
cd server
npm install

cd ../client
npm install
```

### 5) التشغيل

في مجلد `server/`:

```bash
npm run dev
```

الخادم يعمل على المنفذ **5000** (أو `PORT` من `.env`).

في مجلد `client/`:

```bash
npm run dev
```

التطبيق يعمل على **http://localhost:3000**

---

## حسابات تجريبية (بعد تشغيل `schema.sql`)

| الدور    | البريد               | كلمة المرور |
|----------|----------------------|-------------|
| مدير     | admin@dabadibo.com   | password    |
| عميل     | customer@dabadibo.com | password   |

يمكنك أيضاً إنشاء حساب جديد من صفحة التسجيل.

---

## روابط الصفحات

| الصفحة        | المسار              |
|---------------|---------------------|
| الرئيسية      | http://localhost:3000/ |
| المنتجات      | http://localhost:3000/products |
| تفاصيل منتج   | http://localhost:3000/products/:id |
| صانع الهدايا  | http://localhost:3000/gift-builder |
| السلة         | http://localhost:3000/cart |
| تسجيل الدخول  | http://localhost:3000/login |
| التسجيل      | http://localhost:3000/register |

---

## API مختصرة

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products` — فلاتر: `category`, `featured`, `search`, `min_price`, `max_price`, `page`, `limit`
- `GET /api/products/:id`
- `POST /api/auth/register` — `POST /api/auth/login` — `GET /api/auth/me` (مع Bearer Token)
- `POST /api/orders` — يتطلب تسجيل دخول
- `GET /api/orders/my` — `GET /api/orders/:id` — `PUT /api/orders/:id/status` (للمدير)

مسارات إدارة المنتجات (`POST` / `PUT` / `DELETE` على `/api/products`) تتطلب مستخدماً بدور **admin**.
