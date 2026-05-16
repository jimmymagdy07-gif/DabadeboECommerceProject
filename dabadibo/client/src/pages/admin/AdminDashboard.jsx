import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api("/api/admin/stats");
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || "تعذر تحميل الإحصائيات");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
        { label: "المنتجات", value: stats.products_count, color: "bg-daba-pink/40" },
        { label: "الطلبات", value: stats.orders_count, color: "bg-daba-gold/20" },
        { label: "المستخدمون", value: stats.users_count, color: "bg-daba-beige" },
        { label: "الفئات", value: stats.categories_count, color: "bg-white" },
        {
          label: "طلبات قيد الانتظار",
          value: stats.pending_orders,
          color: "bg-amber-100",
        },
        {
          label: "إجمالي قيمة الطلبات",
          value: `${Number(stats.orders_total_value || 0).toFixed(0)} ج.م`,
          color: "bg-emerald-50",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">مرحباً بك في لوحة التحكم</h1>
        <p className="text-sm text-stone-600">نظرة سريعة على المتجر</p>
      </div>

      {err && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-3xl border border-daba-pink/25 p-5 shadow-sm ${c.color}`}
          >
            <p className="text-sm font-semibold text-stone-600">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{c.value}</p>
          </div>
        ))}
      </div>

      {!stats && !err && (
        <p className="text-center text-stone-500">جاري تحميل البيانات...</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/products/new"
          className="inline-flex rounded-full bg-daba-gold px-6 py-2.5 text-sm font-bold text-white shadow"
        >
          + إضافة منتج
        </Link>
        <Link
          to="/admin/orders"
          className="inline-flex rounded-full border border-daba-gold/50 bg-white px-6 py-2.5 text-sm font-bold text-stone-800"
        >
          إدارة الطلبات
        </Link>
        <Link
          to="/admin/categories"
          className="inline-flex rounded-full border border-daba-pink/40 bg-white px-6 py-2.5 text-sm font-bold text-stone-800"
        >
          إدارة الفئات
        </Link>
      </div>
    </div>
  );
}
