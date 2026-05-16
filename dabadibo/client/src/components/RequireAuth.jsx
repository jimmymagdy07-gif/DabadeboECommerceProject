import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-stone-600">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search || ""}`;
    const redirect = encodeURIComponent(next);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
