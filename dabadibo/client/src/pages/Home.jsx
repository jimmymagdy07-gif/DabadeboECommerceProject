import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

function ProductCard({ product }) {
  const img = product.images?.[0];
  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border border-daba-pink/25 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-daba-beige">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🎁</div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 font-semibold text-stone-900">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-daba-gold">{product.price} ج.م</p>
          <span className="text-xs text-stone-500">★ {product.rating}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          api("/api/categories"),
          api("/api/products?featured=true&limit=8"),
        ]);
        if (!cancelled) {
          setCategories(catRes);
          setFeatured(featRes.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative overflow-hidden border-b border-daba-pink/20 bg-daba-beige"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,182,193,0.35), rgba(245,240,235,0.95)), url(https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1600&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:py-28">
          <p className="text-sm font-semibold text-daba-gold">متجر هدايا عربي</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
            اصنع لحظة لا تُنسى 🎁
          </h1>
          <p className="max-w-xl text-stone-700">
            دباديبو يجمع لك الدباديب، البوكسات، الشموع والبطاقات في تجربة تصفح
            ناعمة تناسب أغلى المناسبات.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95"
            >
              تسوق الآن
            </Link>
            <Link
              to="/gift-builder"
              className="inline-flex items-center justify-center rounded-full border border-daba-gold/50 bg-white/80 px-6 py-3 text-sm font-semibold text-stone-800 backdrop-blur hover:bg-white"
            >
              صمّم بوكسك
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">تسوق حسب الفئة</h2>
            <p className="text-sm text-stone-600">خمس مجموعات مختارة بعناية</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-daba-gold">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="overflow-hidden rounded-3xl border border-daba-pink/30 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-daba-beige">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">🎀</div>
                )}
              </div>
              <div className="p-3 text-center">
                <p className="font-bold text-stone-900">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-daba-beige/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900">منتجات مميزة</h2>
            <p className="text-sm text-stone-600">مختارات فريق دباديبو لك</p>
          </div>
          {loading ? (
            <p className="text-center text-stone-500">جاري التحميل...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-[2rem] border border-daba-pink/30 bg-gradient-to-l from-daba-pink/25 via-white to-daba-beige p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-stone-900">
                اصنع بوكس هديتك الخاص
              </h2>
              <p className="max-w-xl text-stone-600">
                اختر الحجم، أضف قطعك المفضلة، اكتب رسالة من القلب، وراجع كل شيء
                قبل الإضافة للسلة.
              </p>
            </div>
            <Link
              to="/gift-builder"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
