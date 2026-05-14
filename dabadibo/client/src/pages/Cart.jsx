import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } =
    useCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const checkout = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!getToken()) {
      setMsg("يرجى تسجيل الدخول لإتمام الطلب.");
      navigate("/login");
      return;
    }
    if (!items.length) return;
    if (!address.trim() || !phone.trim()) {
      setMsg("عنوان الشحن والهاتف مطلوبان.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
          })),
          shipping_address: address.trim(),
          phone: phone.trim(),
          notes: notes.trim() || null,
        }),
      });
      clearCart();
      setAddress("");
      setPhone("");
      setNotes("");
      setMsg("تم إنشاء الطلب بنجاح! يمكنك متابعة الطلبات من صفحة الطلبات لاحقاً.");
    } catch (err) {
      setMsg(err.message || "تعذر إتمام الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">سلة التسوق</h1>
      <p className="text-sm text-stone-600">راجع منتجاتك ثم أتمم الطلب</p>

      {!items.length ? (
        <div className="mt-10 rounded-[2rem] border border-daba-pink/30 bg-daba-beige/50 p-10 text-center">
          <p className="text-stone-700">السلة فارغة حالياً.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-full bg-daba-gold px-6 py-2 text-sm font-bold text-white"
          >
            تابع التسوق
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((i) => (
              <div
                key={i.productId}
                className="flex gap-4 rounded-3xl border border-daba-pink/25 bg-white p-4 shadow-sm"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-daba-beige">
                  {i.image ? (
                    <img
                      src={i.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      🎁
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-semibold text-stone-900">{i.name}</p>
                  <p className="text-sm text-daba-gold">{i.price} ج.م للقطعة</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs text-stone-600">الكمية</label>
                    <input
                      type="number"
                      min={1}
                      className="w-20 rounded-xl border border-daba-pink/40 px-2 py-1 text-center text-sm"
                      value={i.quantity}
                      onChange={(e) =>
                        updateQuantity(i.productId, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(i.productId)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="text-left font-bold text-stone-900">
                  {i.price * i.quantity} ج.م
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-daba-pink/30 bg-daba-beige/50 p-6">
              <p className="text-sm text-stone-600">الإجمالي</p>
              <p className="text-3xl font-bold text-daba-gold">{cartTotal} ج.م</p>
            </div>

            <form
              onSubmit={checkout}
              className="space-y-3 rounded-3xl border border-daba-pink/30 bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold text-stone-900">بيانات التوصيل</h2>
              <textarea
                required
                className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
                placeholder="عنوان الشحن بالتفصيل"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                required
                className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <textarea
                className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
                placeholder="ملاحظات (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {msg && (
                <p className="text-sm text-stone-700 bg-daba-pink/20 rounded-xl px-3 py-2">
                  {msg}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-daba-gold py-3 text-sm font-bold text-white shadow-md disabled:opacity-60"
              >
                {submitting ? "جاري الإرسال..." : "إتمام الطلب"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
