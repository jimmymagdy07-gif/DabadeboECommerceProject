import { Navigate, Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navClass = ({ isActive }) =>
  `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-daba-gold text-white shadow"
      : "text-stone-700 hover:bg-daba-pink/30"
  }`;

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-daba-beige text-stone-600">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-daba-beige/60">
      <aside className="hidden w-64 shrink-0 border-l border-daba-pink/30 bg-white p-4 shadow-sm lg:block">
        <div className="mb-8 rounded-2xl bg-daba-pink/25 px-3 py-4 text-center">
          <p className="text-xs font-semibold text-daba-gold">لوحة التحكم</p>
          <p className="mt-1 text-lg font-bold text-stone-900">دباديبو</p>
          <p className="mt-1 truncate text-xs text-stone-600">{user.email}</p>
        </div>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={navClass}>
            الرئيسية
          </NavLink>
          <NavLink to="/admin/products" className={navClass}>
            المنتجات
          </NavLink>
          <NavLink to="/admin/orders" className={navClass}>
            الطلبات
          </NavLink>
          <NavLink to="/admin/categories" className={navClass}>
            الفئات
          </NavLink>
        </nav>
        <div className="mt-8 space-y-2 border-t border-daba-pink/20 pt-4">
          <NavLink
            to="/"
            className="block rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-daba-beige"
          >
            ← الموقع العام
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-2 text-start text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-daba-pink/30 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-bold text-stone-900">دباديبو — إدارة</p>
          <div className="flex gap-2 text-xs">
            <NavLink
              to="/admin"
              className="rounded-lg bg-daba-beige px-2 py-1 font-semibold"
            >
              لوحة
            </NavLink>
            <NavLink
              to="/admin/products"
              className="rounded-lg bg-daba-beige px-2 py-1 font-semibold"
            >
              منتجات
            </NavLink>
            <NavLink
              to="/admin/orders"
              className="rounded-lg bg-daba-beige px-2 py-1 font-semibold"
            >
              طلبات
            </NavLink>
            <NavLink to="/" className="rounded-lg bg-daba-pink/40 px-2 py-1 font-semibold">
              الموقع
            </NavLink>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
