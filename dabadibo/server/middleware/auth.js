import jwt from "jsonwebtoken";
import { HttpError } from "../util/HttpError.js";

function requireJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || String(s).length < 16) {
    throw new HttpError(503, "JWT_SECRET غير مضبوط أو قصير جداً (16 حرفاً على الأقل)");
  }
  return s;
}

export function authenticateToken(req, res, next) {
  try {
    requireJwtSecret();
  } catch (e) {
    return res.status(e.status).json({ message: e.message });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "مطلوب تسجيل الدخول" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(403).json({ message: "جلسة غير صالحة" });
  }
}

export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "مطلوب تسجيل الدخول" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "غير مصرح" });
  }
  next();
}
