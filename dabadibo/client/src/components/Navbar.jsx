import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    isActive
      ? "bg-daba-pink/40 text-stone-900 font-semibold"
      : "text-stone-600 hover:bg-daba-beige"
  }`;

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-daba-pink/30 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-daba-pink text-lg shadow-sm">
            🧸
          </span>
          <span className="text-xl font-bold tracking-tight text-stone-900">
            دباديبو
          </span>
        </NavLink>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <NavLink to="/" className={linkClass} end>
            الرئيسية
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            المنتجات
          </NavLink>
          <NavLink to="/gift-builder" className={linkClass}>
            صانع الهدايا
          </NavLink>
          <NavLink to="/login" className={linkClass}>
            دخول
          </NavLink>
          <NavLink
            to="/cart"
            className="relative ms-1 inline-flex items-center gap-1 rounded-full border border-daba-gold/50 bg-daba-beige px-3 py-1.5 text-sm font-semibold text-stone-800 shadow-sm"
          >
            <span>السلة</span>
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-daba-gold px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
