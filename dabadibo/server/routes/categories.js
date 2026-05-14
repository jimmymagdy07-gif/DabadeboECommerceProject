import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, slug, image_url, description FROM categories ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
