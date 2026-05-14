import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "الاسم والبريد وكلمة المرور مطلوبة" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length) {
      return res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, 'customer', $4)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email.toLowerCase(), hash, phone || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "البريد وكلمة المرور مطلوبان" });
    }

    const result = await pool.query(
      "SELECT id, name, email, password, role, phone, created_at FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (!result.rows.length) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    delete user.password;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
