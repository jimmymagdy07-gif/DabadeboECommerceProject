const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("dabadibo_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("dabadibo_token", token);
  else localStorage.removeItem("dabadibo_token");
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data?.message || "طلب غير ناجح");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** رفع صور المنتج (مدير فقط) — يعيد مصفوفة مسارات مثل `/uploads/products/...` */
export async function uploadProductImages(fileListOrArray) {
  const files = Array.from(fileListOrArray);
  if (!files.length) return [];
  const form = new FormData();
  for (const f of files) {
    form.append("files", f);
  }
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/uploads/product-images`, {
    method: "POST",
    headers,
    body: form,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data?.message || "فشل رفع الصور");
    err.status = res.status;
    throw err;
  }
  return data.urls || [];
}

export { API_URL };
