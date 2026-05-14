import { Router } from "express";
import { pool } from "../db/pool.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, shipping_address, phone, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "السلة فارغة" });
    }
    if (!shipping_address || !phone) {
      return res.status(400).json({ message: "عنوان الشحن والهاتف مطلوبان" });
    }

    await client.query("BEGIN");

    let total = 0;
    const resolved = [];

    for (const line of items) {
      const { product_id, quantity } = line;
      const q = parseInt(quantity, 10) || 0;
      if (!product_id || q < 1) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "بيانات الطلب غير صالحة" });
      }

      const pr = await client.query(
        "SELECT id, price, stock FROM products WHERE id = $1 FOR UPDATE",
        [product_id]
      );
      if (!pr.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `منتج غير موجود: ${product_id}` });
      }
      const row = pr.rows[0];
      if (row.stock < q) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "الكمية غير متوفرة في المخزون" });
      }

      const lineTotal = Number(row.price) * q;
      total += lineTotal;
      resolved.push({ product_id, quantity: q, price: row.price });
    }

    const orderInsert = await client.query(
      `INSERT INTO orders (user_id, total_price, status, shipping_address, phone, notes)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING *`,
      [req.user.id, total, shipping_address, phone, notes || null]
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
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  } finally {
    client.release();
  }
});

router.get("/my", authenticateToken, async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );
    if (!orderResult.rows.length) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.images AS product_images
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.put("/:id/status", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "حالة غير صالحة" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
