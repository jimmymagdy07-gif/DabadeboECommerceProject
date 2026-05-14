import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";
import categoriesRoutes from "./routes/categories.js";

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "دباديبو API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/categories", categoriesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "خطأ في الخادم" });
});

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
