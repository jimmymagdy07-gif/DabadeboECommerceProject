import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import "./db/pool.js";
import { HttpError } from "./util/HttpError.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";
import categoriesRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import uploadsRoutes from "./routes/uploads.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "uploads");
fs.mkdirSync(path.join(uploadsRoot, "products"), { recursive: true });

export function createApp() {
  const app = express();
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    })
  );
  app.disable("x-powered-by");
  app.use(express.json({ limit: "512kb" }));

  app.use(
    "/uploads",
    express.static(uploadsRoot, {
      maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
      fallthrough: true,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: "دباديبو API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/uploads", uploadsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "المسار غير موجود" });
  });

  app.use((err, _req, res, _next) => {
    if (res.headersSent) return;
    if (
      (err.status === 400 || err.statusCode === 400) &&
      (err.type === "entity.parse.failed" ||
        err instanceof SyntaxError ||
        /JSON|Unexpected token/i.test(String(err.message || "")))
    ) {
      return res.status(400).json({ message: "JSON غير صالح" });
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    const message =
      process.env.NODE_ENV !== "production" && err?.message
        ? err.message
        : "خطأ في الخادم";
    res.status(500).json({ message });
  });

  return app;
}
