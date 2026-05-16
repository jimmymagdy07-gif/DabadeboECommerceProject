import { HttpError } from "../util/HttpError.js";

const MAX = {
  name: 255,
  email: 255,
  productName: 500,
  description: 20000,
  slug: 255,
  address: 5000,
  notes: 5000,
  phone: 50,
  url: 2048,
};

export function assertString(v, field, { max = 500, required = true } = {}) {
  if (v === undefined || v === null) {
    if (!required) return undefined;
    throw new HttpError(400, `${field} مطلوب`);
  }
  const s = String(v).trim();
  if (!s && required) throw new HttpError(400, `${field} مطلوب`);
  if (s.length > max) throw new HttpError(400, `${field} طويل جداً`);
  return s || undefined;
}

export function validateRegisterBody(body) {
  const name = assertString(body.name, "الاسم", { max: MAX.name });
  const email = assertString(body.email, "البريد", { max: MAX.email }).toLowerCase();
  const password = assertString(body.password, "كلمة المرور", { max: 128 });
  if (password.length < 6) {
    throw new HttpError(400, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "بريد إلكتروني غير صالح");
  }
  const phone =
    body.phone != null && String(body.phone).trim()
      ? assertString(body.phone, "الهاتف", { max: MAX.phone, required: false })
      : null;
  return { name, email, password, phone: phone ?? null };
}

export function validateLoginBody(body) {
  const email = assertString(body.email, "البريد", { max: MAX.email }).toLowerCase();
  const password = assertString(body.password, "كلمة المرور", { max: 128 });
  return { email, password };
}

/** إنشاء أو تحديث منتج (نموذج الإدارة يرسل الحقول كاملة) */
export function validateProductBody(body) {
  const name = assertString(body.name, "اسم المنتج", { max: MAX.productName });
  const description =
    body.description == null ? "" : String(body.description);
  if (description.length > MAX.description) {
    throw new HttpError(400, "الوصف طويل جداً");
  }

  const price = Number(body.price);
  if (Number.isNaN(price) || price < 0) throw new HttpError(400, "سعر غير صالح");

  let old_price = null;
  if (body.old_price !== undefined && body.old_price !== null && body.old_price !== "") {
    const op = Number(body.old_price);
    if (Number.isNaN(op) || op < 0) throw new HttpError(400, "السعر القديم غير صالح");
    old_price = op;
  }

  const category_id = parseInt(body.category_id, 10);
  if (!category_id || category_id < 1) throw new HttpError(400, "فئة غير صالحة");

  if (!Array.isArray(body.images)) throw new HttpError(400, "صور غير صالحة");
  const images = body.images
    .map((u) => String(u).trim())
    .filter(Boolean)
    .map((s) => {
      if (s.length > MAX.url) throw new HttpError(400, "رابط صورة طويل جداً");
      if (/^\s*javascript:/i.test(s) || s.startsWith("data:")) {
        throw new HttpError(400, "رابط صورة غير مسموح");
      }
      return s;
    });
  if (images.length > 20) throw new HttpError(400, "عدد الصور كبير جداً");

  const stock = parseInt(body.stock, 10);
  if (Number.isNaN(stock) || stock < 0) throw new HttpError(400, "مخزون غير صالح");

  const is_featured = Boolean(body.is_featured);
  const rating = Number(body.rating);
  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    throw new HttpError(400, "تقييم غير صالح");
  }
  const reviews_count = parseInt(body.reviews_count, 10);
  if (Number.isNaN(reviews_count) || reviews_count < 0) {
    throw new HttpError(400, "عدد التقييمات غير صالح");
  }

  return {
    name,
    description,
    price,
    old_price,
    category_id,
    images,
    stock,
    is_featured,
    rating,
    reviews_count,
  };
}

export function validateOrderCreateBody(body) {
  const shipping_address = assertString(body.shipping_address, "عنوان الشحن", {
    max: MAX.address,
  });
  const phone = assertString(body.phone, "الهاتف", { max: MAX.phone });
  const notes =
    body.notes != null && String(body.notes).trim()
      ? assertString(body.notes, "الملاحظات", { max: MAX.notes, required: false })
      : null;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new HttpError(400, "السلة فارغة");
  }
  if (body.items.length > 50) throw new HttpError(400, "عدد بنود الطلب كبير جداً");
  const items = body.items.map((line, idx) => {
    const product_id = parseInt(line.product_id, 10);
    const quantity = parseInt(line.quantity, 10);
    if (!product_id || product_id < 1) {
      throw new HttpError(400, `منتج غير صالح في السطر ${idx + 1}`);
    }
    if (!quantity || quantity < 1 || quantity > 999) {
      throw new HttpError(400, `كمية غير صالحة في السطر ${idx + 1}`);
    }
    return { product_id, quantity };
  });
  return { shipping_address, phone, notes, items };
}

export function validateCategoryCreate(body) {
  const name = assertString(body.name, "اسم الفئة", { max: 120 });
  const slugRaw = assertString(body.slug, "الـ slug", { max: MAX.slug });
  const slug = String(slugRaw).toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new HttpError(
      400,
      "slug: أحرف إنجليزية صغيرة وأرقام وشرطة فقط (مثل gift-boxes)"
    );
  }
  let image_url = null;
  if (body.image_url != null && String(body.image_url).trim()) {
    image_url = assertString(body.image_url, "رابط الصورة", {
      max: MAX.url,
      required: false,
    });
    if (image_url && (/javascript:/i.test(image_url) || image_url.startsWith("data:"))) {
      throw new HttpError(400, "رابط صورة غير مسموح");
    }
  }
  let description = null;
  if (body.description != null && String(body.description).trim()) {
    const d = String(body.description).trim();
    if (d.length > 5000) throw new HttpError(400, "الوصف طويل جداً");
    description = d;
  }
  return { name, slug, image_url, description };
}
