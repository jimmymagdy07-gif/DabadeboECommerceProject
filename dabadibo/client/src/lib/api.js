const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("dabadibo_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("dabadibo_token", token);
  else localStorage.removeItem("dabadibo_token");
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
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

export { API_URL };
