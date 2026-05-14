import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
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

    if (min_price !== undefined && min_price !== "" && !Number.isNaN(Number(min_price))) {
      conditions.push(`p.price >= $${p}`);
      params.push(Number(min_price));
      p++;
    }
    if (max_price !== undefined && max_price !== "" && !Number.isNaN(Number(max_price))) {
      conditions.push(`p.price <= $${p}`);
      params.push(Number(max_price));
      p++;
    }

    if (category) {
      conditions.push(`(c.slug = $${p} OR c.id::text = $${p})`);
      params.push(String(category));
      p++;
    }

    if (featured === "true" || featured === "1") {
      conditions.push("p.is_featured = TRUE");
    }

    if (search && String(search).trim()) {
      conditions.push(
        `(p.name ILIKE $${p} OR p.description ILIKE $${p})`
      );
      params.push(`%${String(search).trim()}%`);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );
    if (!productResult.rows.length) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    const reviewsResult = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      product: productResult.rows[0],
      reviews: reviewsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      category_id,
      images,
      stock,
      is_featured,
      rating,
      reviews_count,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (
        name, description, price, old_price, category_id, images, stock,
        is_featured, rating, reviews_count
      ) VALUES ($1,$2,$3,$4,$5,$6::text[],$7,$8,$9,$10)
      RETURNING *`,
      [
        name,
        description ?? "",
        price,
        old_price ?? null,
        category_id,
        Array.isArray(images) ? images : [],
        stock ?? 0,
        Boolean(is_featured),
        rating ?? 0,
        reviews_count ?? 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      old_price,
      category_id,
      images,
      stock,
      is_featured,
      rating,
      reviews_count,
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        old_price = $4,
        category_id = COALESCE($5, category_id),
        images = COALESCE($6::text[], images),
        stock = COALESCE($7, stock),
        is_featured = COALESCE($8, is_featured),
        rating = COALESCE($9, rating),
        reviews_count = COALESCE($10, reviews_count)
      WHERE id = $11
      RETURNING *`,
      [
        name ?? null,
        description ?? null,
        price ?? null,
        old_price,
        category_id ?? null,
        Array.isArray(images) ? images : null,
        stock ?? null,
        is_featured ?? null,
        rating ?? null,
        reviews_count ?? null,
        id,
      ]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json({ message: "تم الحذف" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
