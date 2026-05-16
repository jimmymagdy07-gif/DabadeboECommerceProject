import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateOrderCreateBody } from "../middleware/validate.js";
import { HttpError } from "../util/HttpError.js";

const router = Router();

router.param("id", (req, res, next, id) => {
  const n = parseInt(id, 10);
  if (Number.isNaN(n) || n < 1) {
    return res.status(400).json({ message: "معرف طلب غير صالح" });
  }
  req.orderId = n;
  next();
});

router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { shipping_address, phone, notes, items } = validateOrderCreateBody(
      req.body
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let total = 0;
      const resolved = [];

      for (const line of items) {
        const { product_id, quantity } = line;

        const pr = await client.query(
          "SELECT id, price, stock FROM products WHERE id = $1 FOR UPDATE",
          [product_id]
        );
        if (!pr.rows.length) {
          throw new HttpError(400, `منتج غير موجود: ${product_id}`);
        }
        const row = pr.rows[0];
        if (row.stock < quantity) {
          throw new HttpError(400, "الكمية غير متوفرة في المخزون");
        }

        const lineTotal = Number(row.price) * quantity;
        total += lineTotal;
        resolved.push({ product_id, quantity, price: row.price });
      }

      const orderInsert = await client.query(
        `INSERT INTO orders (user_id, total_price, status, shipping_address, phone, notes)
         VALUES ($1, $2, 'pending', $3, $4, $5)
         RETURNING *`,
        [req.user.id, total, shipping_address, phone, notes]
      );
      const order = orderInsert.rows[0];

      for (const line of resolved) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, line.product_id, line.quantity, line.price]
        );
        await client.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
          [line.quantity, line.product_id]
        );
      }

      await client.query("COMMIT");
      res.status(201).json(order);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  })
);

router.get(
  "/my",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'product_name', p.name,
          'product_images', p.images
        )) FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id) AS items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [
      req.orderId,
    ]);
    if (!orderResult.rows.length) {
      throw new HttpError(404, "الطلب غير موجود");
    }
    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      throw new HttpError(403, "غير مصرح");
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.images AS product_images
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [req.orderId]
    );

    res.json({ ...order, items: itemsResult.rows });
  })
);

router.put(
  "/:id/status",
  authenticateToken,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      throw new HttpError(400, "حالة غير صالحة");
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.orderId]
    );
    if (!result.rows.length) {
      throw new HttpError(404, "الطلب غير موجود");
    }
    res.json(result.rows[0]);
  })
);

export default router;
