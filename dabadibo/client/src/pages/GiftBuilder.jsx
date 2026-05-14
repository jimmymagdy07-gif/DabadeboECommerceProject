import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";

const sizes = [
  { id: "small", label: "صغير", extra: 0 },
  { id: "medium", label: "متوسط", extra: 50 },
  { id: "large", label: "كبير", extra: 120 },
];

export default function GiftBuilder() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [boxSize, setBoxSize] = useState("medium");
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/api/products?limit=48")
      .then((res) => setProducts(res.data || []))
      .catch(console.error);
  }, []);

  const sizeInfo = sizes.find((s) => s.id === boxSize) || sizes[1];

  const selectedTotal = Object.entries(lines).reduce((sum, [id, q]) => {
    const p = products.find((x) => String(x.id) === id);
    if (!p || !q) return sum;
    return sum + Number(p.price) * q;
  }, 0);

  const boxFee = sizeInfo.extra;
  const grand = selectedTotal + boxFee;

  const toggleQty = (product, delta) => {
    setLines((prev) => {
      const id = String(product.id);
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  const handleConfirm = () => {
    Object.entries(lines).forEach(([id, q]) => {
      const p = products.find((x) => String(x.id) === id);
      if (p && q > 0) addToCart(p, q);
    });
    navigate("/cart");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">صانع بوكس الهدايا</h1>
      <p className="mt-1 text-sm text-stone-600">أربع خطوات بسيطة لإهداء مثالي</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStep(n)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              step === n
                ? "bg-daba-gold text-white"
                : "border border-daba-pink/40 bg-white text-stone-700"
            }`}
          >
            الخطوة {n}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] border border-daba-pink/30 bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">اختر حجم البوكس</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBoxSize(s.id)}
                  className={`rounded-3xl border px-4 py-6 text-center transition ${
                    boxSize === s.id
                      ? "border-daba-gold bg-daba-beige shadow-md"
                      : "border-daba-pink/30 hover:border-daba-gold/50"
                  }`}
                >
                  <p className="text-lg font-bold">{s.label}</p>
                  <p className="mt-1 text-xs text-stone-600">
                    رسوم البوكس: +{s.extra} ج.م
                  </p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-4 rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white"
            >
              التالي
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">اختر المنتجات</h2>
            <div className="grid max-h-[480px] gap-3 overflow-y-auto sm:grid-cols-2">
              {products.map((p) => {
                const q = lines[String(p.id)] || 0;
                const img = p.images?.[0];
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl border border-daba-pink/25 bg-daba-beige/40 p-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">🎁</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-daba-gold">{p.price} ج.م</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-white text-lg font-bold shadow"
                        onClick={() => toggleQty(p, -1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{q}</span>
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-daba-pink text-lg font-bold shadow"
                        onClick={() => toggleQty(p, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-daba-pink/40 px-6 py-2 text-sm font-semibold"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full bg-daba-gold px-8 py-2 text-sm font-bold text-white"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">رسالة مخصصة</h2>
            <textarea
              className="min-h-[160px] w-full rounded-3xl border border-daba-pink/40 bg-daba-beige/30 p-4 text-sm"
              placeholder="اكتب رسالتك هنا... ستُستخدم كمرجع عند تجهيز الطلب."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full border border-daba-pink/40 px-6 py-2 text-sm font-semibold"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-full bg-daba-gold px-8 py-2 text-sm font-bold text-white"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">مراجعة وتأكيد</h2>
            <ul className="space-y-2 text-sm text-stone-700">
              <li>
                <span className="font-semibold">الحجم:</span> {sizeInfo.label}
              </li>
              <li>
                <span className="font-semibold">الرسالة:</span>{" "}
                {message || "— بدون رسالة —"}
              </li>
            </ul>
            <div className="rounded-2xl border border-daba-pink/30 bg-daba-beige/40 p-4">
              <p className="text-sm font-semibold text-stone-900">المنتجات</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(lines).map(([id, q]) => {
                  const p = products.find((x) => String(x.id) === id);
                  if (!p || !q) return null;
                  return (
                    <li key={id} className="flex justify-between gap-2">
                      <span>
                        {p.name} × {q}
                      </span>
                      <span>{Number(p.price) * q} ج.م</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 border-t border-daba-pink/30 pt-3 text-sm">
                <div className="flex justify-between">
                  <span>رسوم البوكس</span>
                  <span>{boxFee} ج.م</span>
                </div>
                <div className="mt-1 flex justify-between font-bold text-daba-gold">
                  <span>الإجمالي التقريبي</span>
                  <span>{grand} ج.م</span>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  سيتم احتساب السعر النهائي حسب المنتجات في السلة؛ أضف ملاحظة الطلب
                  عند إتمام الشراء إن رغبت بطباعة الرسالة على البطاقة.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full border border-daba-pink/40 px-6 py-2 text-sm font-semibold"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-daba-gold px-8 py-3 text-sm font-bold text-white shadow-md"
              >
                أضف للسلة واذهب للدفع
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
