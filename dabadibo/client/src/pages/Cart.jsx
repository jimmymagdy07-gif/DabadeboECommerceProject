import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function Cart() {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">سلة التسوق</h1>
      <p className="text-sm text-stone-600">راجع منتجاتك ثم انتقل لإتمام الطلب</p>

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
                      src={mediaUrl(i.image)}
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

            <div className="rounded-3xl border border-daba-pink/30 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-stone-900">الخطوة التالية</h2>
              <p className="mb-4 text-sm text-stone-600">
                لإتمام الطلب ستحتاج لتسجيل الدخول. سيتم حفظ سلتك محلياً حتى تعود.
              </p>
              {user ? (
                <Link
                  to="/checkout"
                  className="flex w-full justify-center rounded-full bg-daba-gold py-3 text-sm font-bold text-white shadow-md"
                >
                  متابعة للدفع
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to={`/login?redirect=${encodeURIComponent("/checkout")}`}
                    className="flex w-full justify-center rounded-full bg-daba-gold py-3 text-sm font-bold text-white shadow-md"
                  >
                    تسجيل الدخول للدفع
                  </Link>
                  <Link
                    to={`/register?redirect=${encodeURIComponent("/checkout")}`}
                    className="flex w-full justify-center rounded-full border border-daba-pink/40 py-2.5 text-sm font-semibold text-stone-800"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
