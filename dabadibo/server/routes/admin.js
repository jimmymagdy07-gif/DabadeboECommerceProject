import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/stats",
  authenticateToken,
  isAdmin,
  asyncHandler(async (_req, res) => {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM products) AS products_count,
        (SELECT COUNT(*)::int FROM orders) AS orders_count,
        (SELECT COUNT(*)::int FROM users) AS users_count,
        (SELECT COUNT(*)::int FROM categories) AS categories_count,
        (SELECT COALESCE(SUM(total_price), 0) FROM orders) AS orders_total_value,
        (SELECT COUNT(*)::int FROM orders WHERE status = 'pending') AS pending_orders
    `);
    res.json(result.rows[0]);
  })
);

router.get(
  "/orders",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { page = "1", limit = "20", status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const allowed = ["pending", "confirmed", "shipped", "delivered"];
    const conditions = [];
    const params = [];
    let p = 1;

    if (status && allowed.includes(String(status))) {
      conditions.push(`o.status = $${p}`);
      params.push(String(status));
      p++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*)::int AS total FROM orders o ${where}
    `;
    const countResult = await pool.query(countSql, params);
    const total = countResult.rows[0].total;

    const dataSql = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ${where}
      ORDER BY o.created_at DESC
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

export default router;
