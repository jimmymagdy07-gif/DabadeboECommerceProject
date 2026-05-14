-- دباديبو - مخطط PostgreSQL
-- تشغيل: psql "$DATABASE_URL" -f schema.sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  description TEXT
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  old_price NUMERIC(12, 2),
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gift_boxes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  custom_message TEXT,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gift_box_items (
  id SERIAL PRIMARY KEY,
  gift_box_id INTEGER NOT NULL REFERENCES gift_boxes(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_price NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered')),
  shipping_address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- كلمات المرور للتجربة: password (نفس الهاش لـ bcrypt)
INSERT INTO users (name, email, password, role, phone) VALUES
(
  'مدير دباديبو',
  'admin@dabadibo.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  '01000000001'
),
(
  'سارة أحمد',
  'customer@dabadibo.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'customer',
  '01022223333'
);

INSERT INTO categories (name, slug, image_url, description) VALUES
(
  'دباديب',
  'teddy-bears',
  'https://images.unsplash.com/photo-1559454404-eab7eeefb2bc?w=600&q=80',
  'دباديب ناعمة وهدايا عاطفية دافئة'
),
(
  'بوكسات هدايا',
  'gift-boxes',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
  'بوكسات جاهزة للمناسبات والأعياد'
),
(
  'شموع وديكور',
  'candles',
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8cd?w=600&q=80',
  'شموع معطرة وقطع ديكور أنيقة'
),
(
  'بطاقات',
  'cards',
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80',
  'بطاقات تهنئة وشكر بتصاميم راقية'
),
(
  'إكسسوارات',
  'accessories',
  'https://images.unsplash.com/photo-1515562140607-7a38dd68be90?w=600&q=80',
  'إكسسوارات وهدايا صغيرة مميزة'
);

INSERT INTO products (
  name, description, price, old_price, category_id, images, stock, is_featured, rating, reviews_count
) VALUES
(
  'دبدوب قلب أحمر كبير',
  'دبدوب فرو ناعم بقلب أحمر، مناسب للتعبير عن الحب والاهتمام.',
  299,
  349,
  1,
  ARRAY['https://images.unsplash.com/photo-1563903530908-afdd155d0a77?w=800&q=80'],
  40,
  TRUE,
  4.8,
  12
),
(
  'بوكس عيد ميلاد للبنات',
  'بوكس وردي يضم شموع صغيرة وبطاقة وشريط حريري.',
  450,
  NULL,
  2,
  ARRAY['https://images.unsplash.com/photo-1527161158934-fb0777be6220?w=800&q=80'],
  25,
  TRUE,
  4.6,
  8
),
(
  'شمعة برائحة الفانيليا',
  'شمع صويا طبيعي برائحة فانيليا دافئة، حرق طويل.',
  120,
  140,
  3,
  ARRAY['https://images.unsplash.com/photo-1603006905006-38f301e1b593?w=800&q=80'],
  60,
  TRUE,
  4.5,
  20
),
(
  'بطاقة تهنئة مع إطار',
  'بطاقة ورقية فاخرة مع إطار ذهبي بسيط.',
  85,
  NULL,
  4,
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'],
  100,
  FALSE,
  4.2,
  5
),
(
  'دبدوب بلون بني كلاسيك',
  'دبدوب كلاسيكي بلون بني دافئ، مناسب لكل الأعمار.',
  199,
  229,
  1,
  ARRAY['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80'],
  35,
  TRUE,
  4.7,
  15
),
(
  'بوكس خطوبة مميز',
  'بوكس فاخر مع ورد مجفف وبطاقة تهنئة قابلة للتخصيص.',
  850,
  950,
  2,
  ARRAY['https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80'],
  10,
  TRUE,
  4.9,
  6
),
(
  'شمعة وردة مع حامل زجاجي',
  'شمعة على شكل وردة داخل حامل زجاجي أنيق.',
  165,
  NULL,
  3,
  ARRAY['https://images.unsplash.com/photo-1605651537212-6e8a634460f5?w=800&q=80'],
  30,
  FALSE,
  4.4,
  9
),
(
  'بطاقة شكر بتصميم ذهبي',
  'طباعة ذهبية ناعمة مع ظرف متناسق.',
  45,
  NULL,
  4,
  ARRAY['https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80'],
  200,
  FALSE,
  4.0,
  11
),
(
  'سوار هدايا فضي قابل للنقش',
  'سوار ستانلس ستيل مع إمكانية نقش اسم أو تاريخ.',
  220,
  260,
  5,
  ARRAY['https://images.unsplash.com/photo-1611591437289-483c9e8a2e88?w=800&q=80'],
  45,
  FALSE,
  4.3,
  7
),
(
  'دبدوب أبي ناعم صغير',
  'حجم صغير مناسب للحقائب والمكاتب.',
  149,
  NULL,
  1,
  ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
  50,
  FALSE,
  4.5,
  10
),
(
  'بوكس شوكولاتة فاخر',
  'تشكيلة شوكولاتة بلجيكية داخل بوكس أنيق.',
  320,
  360,
  2,
  ARRAY['https://images.unsplash.com/photo-1549007994-c11d517e5ea1?w=800&q=80'],
  22,
  TRUE,
  4.8,
  14
),
(
  'حقيبة هدايا مخملية وردية',
  'حقيبة مخملية لحفظ الهدايا الصغيرة بأناقة.',
  175,
  NULL,
  5,
  ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'],
  38,
  FALSE,
  4.1,
  4
);

-- تقييمات تجريبية (المستخدم id=2)
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'جودة ممتازة والتوصيل سريع، أنصح به بشدة!'),
(2, 3, 4, 'رائحة الفانيليا هادئة وجميلة.'),
(2, 6, 5, 'بوكس الخطوبة فاخر جداً، فرحت العروسة.');

UPDATE products p SET
  rating = sub.avg_r,
  reviews_count = sub.cnt
FROM (
  SELECT product_id, ROUND(AVG(rating)::numeric, 2) AS avg_r, COUNT(*)::int AS cnt
  FROM reviews GROUP BY product_id
) sub
WHERE p.id = sub.product_id;
