import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { mediaUrl } from "../lib/mediaUrl.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [payload, setPayload] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api(`/api/products/${id}`);
        if (!cancelled) setPayload(res);
      } catch (e) {
        if (!cancelled) setError(e.message || "غير موجود");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-600">
        {error}
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-500">
        جاري التحميل...
      </div>
    );
  }

  const { product, reviews } = payload;
  const images = product.images?.length ? product.images : [null];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[2rem] border border-daba-pink/30 bg-daba-beige">
            {images[0] ? (
              <img
                src={mediaUrl(images[0])}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-6xl">
                🎁
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.slice(1).map((src, i) => (
                <img
                  key={i}
                  src={mediaUrl(src)}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-daba-pink/30"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-daba-gold">
            {product.category_name}
          </p>
          <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>
          <p className="leading-relaxed text-stone-700">{product.description}</p>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold text-daba-gold">{product.price} ج.م</p>
            {product.old_price && (
              <p className="text-lg text-stone-400 line-through">
                {product.old_price} ج.م
              </p>
            )}
          </div>
          <p className="text-sm text-stone-500">
            ★ {product.rating} — {product.reviews_count} تقييم — متوفر{" "}
            {product.stock} قطعة
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-stone-700">الكمية</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              className="w-24 rounded-2xl border border-daba-pink/40 px-3 py-2 text-center text-sm"
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(
                    product.stock,
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                )
              }
            />
            <button
              type="button"
              onClick={() => addToCart(product, qty)}
              className="rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95"
            >
              أضف للسلة
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 rounded-[2rem] border border-daba-pink/25 bg-daba-beige/40 p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-stone-900">تقييمات العملاء</h2>
        {reviews?.length ? (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-stone-900">{r.user_name}</p>
                  <span className="text-sm text-daba-gold">★ {r.rating}</span>
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {r.comment}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-400">
                  {new Date(r.created_at).toLocaleDateString("ar-EG")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-600">لا توجد تقييمات بعد.</p>
        )}
      </section>
    </div>
  );
}
