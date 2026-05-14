import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "فشل تسجيل الدخول");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-daba-pink/30 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-stone-600">مرحباً بعودتك إلى دباديبو</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-daba-pink/40 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              className="w-full rounded-2xl border border-daba-pink/40 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-daba-gold py-3 text-sm font-bold text-white shadow-md"
          >
            دخول
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          ليس لديك حساب؟{" "}
          <Link className="font-bold text-daba-gold" to="/register">
            سجّل الآن
          </Link>
        </p>
      </div>
    </div>
  );
}
