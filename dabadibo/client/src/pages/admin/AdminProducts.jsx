import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { mediaUrl } from "../../lib/mediaUrl.js";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "12");
    if (search.trim()) p.set("search", search.trim());
    return p.toString();
  }, [page, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api(`/api/products?${qs}`);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      setMsg(e.message || "خطأ في التحميل");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`حذف المنتج «${name}»؟`)) return;
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      setMsg("تم الحذف.");
      load();
    } catch (e) {
      setMsg(e.message || "تعذر الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">المنتجات</h1>
          <p className="text-sm text-stone-600">عرض، تعديل، وحذف</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex justify-center rounded-full bg-daba-gold px-6 py-2.5 text-sm font-bold text-white shadow"
        >
          + منتج جديد
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-3xl border border-daba-pink/25 bg-white p-4 shadow-sm">
        <input
          className="min-w-[200px] flex-1 rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
          placeholder="بحث بالاسم أو الوصف..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {msg && (
        <p className="rounded-2xl bg-daba-beige px-4 py-2 text-sm text-stone-800">{msg}</p>
      )}

      <div className="overflow-x-auto rounded-3xl border border-daba-pink/25 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-daba-pink/20 text-sm">
          <thead className="bg-daba-beige/80 text-stone-700">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">#</th>
              <th className="px-4 py-3 text-start font-semibold">الصورة</th>
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">السعر</th>
              <th className="px-4 py-3 text-start font-semibold">المخزون</th>
              <th className="px-4 py-3 text-start font-semibold">مميز</th>
              <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-daba-pink/15">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  لا توجد منتجات
                </td>
              </tr>
            ) : (
              data.map((p) => {
                const img = p.images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-daba-beige/40">
                    <td className="px-4 py-3 font-mono text-stone-500">{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-daba-beige">
                        {img ? (
                          <img src={mediaUrl(img)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">🎁</div>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 font-semibold text-stone-900">
                      <span className="line-clamp-2">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-daba-gold">{p.price} ج.م</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.is_featured ? "نعم" : "لا"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="rounded-full bg-daba-pink/50 px-3 py-1 text-xs font-bold text-stone-900"
                        >
                          تعديل
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            className={`h-9 min-w-[2.25rem] rounded-full px-3 text-sm font-semibold ${
              n === page ? "bg-daba-gold text-white" : "border border-daba-pink/40 bg-white"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
