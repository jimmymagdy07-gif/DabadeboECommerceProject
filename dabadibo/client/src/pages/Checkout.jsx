import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!items.length) {
      navigate("/cart");
      return;
    }
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
      setMsg("تم إنشاء الطلب بنجاح!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMsg(err.message || "تعذر إتمام الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-stone-700">السلة فارغة.</p>
        <Link to="/cart" className="mt-4 inline-block font-bold text-daba-gold">
          العودة للسلة
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">إتمام الطلب</h1>
      <p className="text-sm text-stone-600">تأكيد بيانات التوصيل والدفع</p>

      <div className="mt-8 space-y-4 rounded-3xl border border-daba-pink/25 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-stone-900">ملخص السلة</h2>
        <ul className="divide-y divide-daba-pink/15 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-3 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-daba-beige">
                {i.image ? (
                  <img
                    src={mediaUrl(i.image)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">🎁</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{i.name}</p>
                <p className="text-stone-500">
                  {i.price} × {i.quantity}
                </p>
              </div>
              <p className="font-bold">{i.price * i.quantity} ج.م</p>
            </li>
          ))}
        </ul>
        <p className="text-end text-lg font-bold text-daba-gold">الإجمالي: {cartTotal} ج.م</p>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 space-y-3 rounded-3xl border border-daba-pink/30 bg-daba-beige/40 p-6 shadow-sm"
      >
        <h2 className="font-bold text-stone-900">بيانات التوصيل</h2>
        <textarea
          required
          className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
          placeholder="عنوان الشحن بالتفصيل"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          required
          className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
          placeholder="رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="w-full rounded-2xl border border-daba-pink/30 bg-white px-3 py-2 text-sm"
          placeholder="ملاحظات (اختياري)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {msg && (
          <p className="rounded-xl bg-daba-pink/30 px-3 py-2 text-sm text-stone-800">{msg}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60"
          >
            {submitting ? "جاري الإرسال..." : "تأكيد الطلب"}
          </button>
          <Link
            to="/cart"
            className="rounded-full border border-daba-pink/40 px-6 py-3 text-sm font-semibold text-stone-800"
          >
            تعديل السلة
          </Link>
        </div>
      </form>
    </div>
  );
}
