import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api.js";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone }),
      });
      setToken(res.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "تعذر إنشاء الحساب");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-daba-pink/30 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">إنشاء حساب</h1>
        <p className="mt-1 text-sm text-stone-600">انضم إلى عائلة دباديبو</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">
              الاسم
            </label>
            <input
              required
              className="w-full rounded-2xl border border-daba-pink/40 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              الهاتف (اختياري)
            </label>
            <input
              className="w-full rounded-2xl border border-daba-pink/40 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              minLength={6}
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
            تسجيل
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          لديك حساب؟{" "}
          <Link className="font-bold text-daba-gold" to="/login">
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
