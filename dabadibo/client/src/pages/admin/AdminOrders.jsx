import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const statuses = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
];

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const p = new URLSearchParams({ page: String(page), limit: "15" });
      if (status) p.set("status", status);
      const res = await api(`/api/admin/orders?${p.toString()}`);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      setMsg(e.message || "خطأ في التحميل");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId, newStatus) => {
    setMsg("");
    try {
      await api(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setMsg("تم تحديث حالة الطلب.");
      load();
    } catch (e) {
      setMsg(e.message || "تعذر التحديث");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">الطلبات</h1>
        <p className="text-sm text-stone-600">عرض وتحديث حالة التوصيل</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-daba-pink/25 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-stone-700">تصفية:</label>
        <select
          className="rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {msg && (
        <p className="rounded-2xl bg-daba-beige px-4 py-2 text-sm text-stone-800">{msg}</p>
      )}

      <div className="overflow-x-auto rounded-3xl border border-daba-pink/25 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-daba-pink/20 text-sm">
          <thead className="bg-daba-beige/80 text-stone-700">
            <tr>
              <th className="px-3 py-3 text-start font-semibold">#</th>
              <th className="px-3 py-3 text-start font-semibold">العميل</th>
              <th className="px-3 py-3 text-start font-semibold">الإجمالي</th>
              <th className="px-3 py-3 text-start font-semibold">الحالة</th>
              <th className="px-3 py-3 text-start font-semibold">الهاتف</th>
              <th className="px-3 py-3 text-start font-semibold">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-daba-pink/15">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  لا توجد طلبات
                </td>
              </tr>
            ) : (
              data.map((o) => (
                <tr key={o.id} className="align-top hover:bg-daba-beige/40">
                  <td className="px-3 py-3 font-mono text-stone-500">{o.id}</td>
                  <td className="max-w-[180px] px-3 py-3">
                    <p className="font-semibold text-stone-900">{o.user_name}</p>
                    <p className="truncate text-xs text-stone-500">{o.user_email}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-bold text-daba-gold">
                    {o.total_price} ج.م
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="max-w-[140px] rounded-xl border border-daba-pink/40 px-2 py-1 text-xs font-semibold"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-xs text-stone-700">{o.phone}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-500">
                    {new Date(o.created_at).toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))
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
