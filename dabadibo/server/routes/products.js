import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateProductBody } from "../middleware/validate.js";
import { HttpError } from "../util/HttpError.js";

const router = Router();

router.param("id", (req, res, next, id) => {
  const n = parseInt(id, 10);
  if (Number.isNaN(n) || n < 1) {
    return res.status(400).json({ message: "معرف منتج غير صالح" });
  }
  req.productId = n;
  next();
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      category,
      featured,
      search,
      min_price,
      max_price,
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let p = 1;

    if (
      min_price !== undefined &&
      min_price !== "" &&
      !Number.isNaN(Number(min_price))
    ) {
      conditions.push(`p.price >= $${p}`);
      params.push(Number(min_price));
      p++;
    }
    if (
      max_price !== undefined &&
      max_price !== "" &&
      !Number.isNaN(Number(max_price))
    ) {
      conditions.push(`p.price <= $${p}`);
      params.push(Number(max_price));
      p++;
    }

    if (category) {
      const cat = String(category).slice(0, 120);
      conditions.push(`(c.slug = $${p} OR c.id::text = $${p})`);
      params.push(cat);
      p++;
    }

    if (featured === "true" || featured === "1") {
      conditions.push("p.is_featured = TRUE");
    }

    if (search && String(search).trim()) {
      conditions.push(`(p.name ILIKE $${p} OR p.description ILIKE $${p})`);
      params.push(`%${String(search).trim().slice(0, 200)}%`);
      p++;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${where}
    `;
    const countResult = await pool.query(countSql, params);
    const total = countResult.rows[0].total;

    const dataSql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${p} OFFSET $${p + 1}
    `;
    const dataResult = await pool.query(dataSql, [...params, limitNum, offset]);

    res.json({
      data: dataResult.rows,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const productResult = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.productId]
    );
    if (!productResult.rows.length) {
      throw new HttpError(404, "المنتج غير موجود");
    }

    const reviewsResult = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.productId]
    );

    res.json({
      product: productResult.rows[0],
      reviews: reviewsResult.rows,
    });
  })
);

router.post(
  "/",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const v = validateProductBody(req.body);
    const result = await pool.query(
      `INSERT INTO products (
        name, description, price, old_price, category_id, images, stock,
        is_featured, rating, reviews_count
      ) VALUES ($1,$2,$3,$4,$5,$6::text[],$7,$8,$9,$10)
      RETURNING *`,
      [
        v.name,
        v.description,
        v.price,
        v.old_price,
        v.category_id,
        v.images,
        v.stock,
        v.is_featured,
        v.rating,
        v.reviews_count,
      ]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const v = validateProductBody(req.body);
    const result = await pool.query(
      `UPDATE products SET
        name = $1,
        description = $2,
        price = $3,
        old_price = $4,
        category_id = $5,
        images = $6::text[],
        stock = $7,
        is_featured = $8,
        rating = $9,
        reviews_count = $10
      WHERE id = $11
      RETURNING *`,
      [
        v.name,
        v.description,
        v.price,
        v.old_price,
        v.category_id,
        v.images,
        v.stock,
        v.is_featured,
        v.rating,
        v.reviews_count,
        req.productId,
      ]
    );
    if (!result.rows.length) {
      throw new HttpError(404, "المنتج غير موجود");
    }
    res.json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [req.productId]
    );
    if (!result.rows.length) {
      throw new HttpError(404, "المنتج غير موجود");
    }
    res.json({ message: "تم الحذف" });
  })
);

export default router;
