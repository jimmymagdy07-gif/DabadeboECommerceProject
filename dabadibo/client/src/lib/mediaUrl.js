import { API_URL } from "./api.js";

/** يحوّل مسار `/uploads/...` إلى رابط كامل للعرض في المتصفح */
export function mediaUrl(url) {
  if (!url) return "";
  const s = String(url);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_URL}${s}`;
  return s;
}
