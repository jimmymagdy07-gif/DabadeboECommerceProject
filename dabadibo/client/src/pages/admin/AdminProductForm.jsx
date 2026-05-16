import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, uploadProductImages } from "../../lib/api.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  category_id: "",
  imagesText: "",
  stock: "",
  is_featured: false,
  rating: "0",
  reviews_count: "0",
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api(`/api/products/${id}`);
        const p = res.product;
        if (!cancelled) {
          setForm({
            name: p.name || "",
            description: p.description || "",
            price: String(p.price ?? ""),
            old_price: p.old_price != null ? String(p.old_price) : "",
            category_id: String(p.category_id ?? ""),
            imagesText: Array.isArray(p.images) ? p.images.join("\n") : "",
            stock: String(p.stock ?? "0"),
            is_featured: Boolean(p.is_featured),
            rating: String(p.rating ?? "0"),
            reviews_count: String(p.reviews_count ?? "0"),
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "تعذر تحميل المنتج");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const parseImages = () =>
    form.imagesText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

  const onPickFiles = async (e) => {
    const list = e.target.files;
    if (!list?.length) return;
    setErr("");
    setUploadBusy(true);
    try {
      const urls = await uploadProductImages(list);
      const prev = form.imagesText.trim();
      const add = urls.join("\n");
      setForm((f) => ({
        ...f,
        imagesText: prev ? `${prev}\n${add}` : add,
      }));
    } catch (er) {
      setErr(er.message || "فشل رفع الصور");
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      old_price: form.old_price === "" ? null : Number(form.old_price),
      category_id: Number(form.category_id),
      images: parseImages(),
      stock: parseInt(form.stock, 10) || 0,
      is_featured: form.is_featured,
      rating: Number(form.rating) || 0,
      reviews_count: parseInt(form.reviews_count, 10) || 0,
    };

    if (!payload.name || !payload.category_id || Number.isNaN(payload.price)) {
      setErr("الاسم والفئة والسعر مطلوبة بشكل صحيح.");
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await api(`/api/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/admin/products");
    } catch (e) {
      setErr(e.message || "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-stone-600">جاري التحميل...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isEdit ? "تعديل منتج" : "منتج جديد"}
          </h1>
          <p className="text-sm text-stone-600">املأ الحقول ثم احفظ</p>
        </div>
        <Link
          to="/admin/products"
          className="text-sm font-semibold text-daba-gold hover:underline"
        >
          ← رجوع
        </Link>
      </div>

      {err && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-4 rounded-3xl border border-daba-pink/25 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">الاسم</label>
          <input
            required
            className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">الوصف</label>
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-stone-600">السعر (ج.م)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-stone-600">
              السعر القديم (اختياري)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
              value={form.old_price}
              onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-stone-600">الفئة</label>
            <select
              required
              className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">— اختر —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-stone-600">المخزون</label>
            <input
              type="number"
              min="0"
              className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">
            رفع صور من الجهاز (jpg, png, webp, gif — حتى 5 ميجا لكل ملف)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploadBusy || saving}
            onChange={onPickFiles}
            className="block w-full max-w-md text-sm file:me-3 file:rounded-xl file:border-0 file:bg-daba-pink file:px-4 file:py-2 file:font-semibold"
          />
          {uploadBusy && (
            <p className="mt-1 text-xs text-stone-500">جاري الرفع...</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">
            روابط الصور (سطر لكل رابط) — اختياري بجانب الرفع
          </label>
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-daba-pink/30 px-3 py-2 font-mono text-xs"
            placeholder="https://..."
            value={form.imagesText}
            onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_featured: e.target.checked }))
              }
            />
            منتج مميز
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">التقييم</span>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="w-24 rounded-xl border border-daba-pink/30 px-2 py-1 text-sm"
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">عدد التقييمات</span>
            <input
              type="number"
              min="0"
              className="w-24 rounded-xl border border-daba-pink/30 px-2 py-1 text-sm"
              value={form.reviews_count}
              onChange={(e) =>
                setForm((f) => ({ ...f, reviews_count: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-daba-gold px-8 py-2.5 text-sm font-bold text-white shadow disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
          <Link
            to="/admin/products"
            className="rounded-full border border-daba-pink/40 px-6 py-2.5 text-sm font-semibold text-stone-700"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
