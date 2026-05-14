import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
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
