import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { mediaUrl } from "../lib/mediaUrl.js";
import { useCart } from "../context/CartContext.jsx";

function useDebounced(value, ms = 400) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

export default function Products() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const debouncedSearch = useDebounced(search, 450);

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const prevQ = next.get("q") || "";
    if (prevQ === (debouncedSearch || "")) return;
    if (debouncedSearch) next.set("q", debouncedSearch);
    else next.delete("q");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }, [debouncedSearch]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (minPrice) p.set("min_price", minPrice);
    if (maxPrice) p.set("max_price", maxPrice);
    p.set("page", String(page));
    p.set("limit", "12");
    return p.toString();
  }, [category, debouncedSearch, minPrice, maxPrice, page]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/api/products?${queryString}`);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("/api/categories")
      .then(setCategories)
      .catch(console.error);
  }, []);

  const setPage = (n) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(n));
    setSearchParams(next);
  };

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set("min", minPrice);
    else next.delete("min");
    if (maxPrice) next.set("max", maxPrice);
    else next.delete("max");
    next.set("page", "1");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">جميع المنتجات</h1>
        <p className="text-sm text-stone-600">فلترة، بحث، وتصفح مريح</p>
      </div>

      <div className="mb-8 grid gap-4 rounded-3xl border border-daba-pink/25 bg-daba-beige/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">
            الفئة
          </label>
          <select
            className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set("category", e.target.value);
              else next.delete("category");
              next.set("page", "1");
              setSearchParams(next);
            }}
          >
            <option value="">كل الفئات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">
            البحث
          </label>
          <input
            className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">
            أقل سعر
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-stone-600">
              أعلى سعر
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-2xl bg-daba-gold px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            تطبيق السعر
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-stone-500">جاري التحميل...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const img = p.images?.[0];
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-daba-pink/25 bg-white shadow-sm"
              >
                <Link to={`/products/${p.id}`} className="block">
                  <div className="aspect-square bg-daba-beige">
                    {img ? (
                      <img
                        src={mediaUrl(img)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🎁
                      </div>
                    )}
                  </div>
                </Link>
                <div className="space-y-2 p-4">
                  <Link
                    to={`/products/${p.id}`}
                    className="line-clamp-2 font-semibold text-stone-900 hover:text-daba-gold"
                  >
                    {p.name}
                  </Link>
                  <div className="flex items-center justify-between text-sm text-stone-500">
                    <span>★ {p.rating}</span>
                    <span>{p.reviews_count} تقييم</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-daba-gold">{p.price} ج.م</p>
                      {p.old_price && (
                        <p className="text-xs text-stone-400 line-through">
                          {p.old_price} ج.م
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      className="rounded-full bg-daba-pink px-4 py-2 text-xs font-bold text-stone-900 shadow-sm transition hover:brightness-95"
                    >
                      أضف للسلة
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            className={`h-9 min-w-[2.25rem] rounded-full px-3 text-sm font-semibold ${
              n === page
                ? "bg-daba-gold text-white"
                : "border border-daba-pink/40 bg-white text-stone-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
