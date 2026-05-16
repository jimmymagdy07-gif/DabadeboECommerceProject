import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateCategoryCreate } from "../middleware/validate.js";
import { HttpError } from "../util/HttpError.js";

const router = Router();

router.param("id", (req, res, next, id) => {
  const n = parseInt(id, 10);
  if (Number.isNaN(n) || n < 1) {
    return res.status(400).json({ message: "معرف فئة غير صالح" });
  }
  req.categoryId = n;
  next();
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      "SELECT id, name, slug, image_url, description FROM categories ORDER BY id"
    );
    res.json(result.rows);
  })
);

router.post(
  "/",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { name, slug, image_url, description } = validateCategoryCreate(req.body);
    try {
      const result = await pool.query(
        `INSERT INTO categories (name, slug, image_url, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, slug, image_url, description`,
        [name, slug, image_url, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw new HttpError(409, "الـ slug مستخدم مسبقاً");
      }
      throw err;
    }
  })
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { name, slug, image_url, description } = validateCategoryCreate(req.body);
    try {
      const result = await pool.query(
        `UPDATE categories SET
          name = $1,
          slug = $2,
          image_url = $3,
          description = $4
        WHERE id = $5
        RETURNING id, name, slug, image_url, description`,
        [name, slug, image_url, description, req.categoryId]
      );
      if (!result.rows.length) {
        throw new HttpError(404, "الفئة غير موجودة");
      }
      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw new HttpError(409, "الـ slug مستخدم مسبقاً");
      }
      throw err;
    }
  })
);

router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const cnt = await pool.query(
      "SELECT COUNT(*)::int AS n FROM products WHERE category_id = $1",
      [req.categoryId]
    );
    if (cnt.rows[0].n > 0) {
      throw new HttpError(
        400,
        "لا يمكن حذف فئة مرتبطة بمنتجات. انقل المنتجات أولاً أو احذفها."
      );
    }
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [req.categoryId]
    );
    if (!result.rows.length) {
      throw new HttpError(404, "الفئة غير موجودة");
    }
    res.json({ message: "تم الحذف" });
  })
);

export default router;
