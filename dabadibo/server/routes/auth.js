import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRegisterBody, validateLoginBody } from "../middleware/validate.js";
import { HttpError } from "../util/HttpError.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = validateRegisterBody(req.body);

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length) {
      throw new HttpError(409, "البريد الإلكتروني مستخدم مسبقاً");
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, 'customer', $4)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hash, phone]
    );

    const user = result.rows[0];
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      throw new HttpError(503, "JWT_SECRET غير مضبوط في الخادم");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = validateLoginBody(req.body);

    const result = await pool.query(
      "SELECT id, name, email, password, role, phone, created_at FROM users WHERE email = $1",
      [email]
    );
    if (!result.rows.length) {
      throw new HttpError(401, "بيانات الدخول غير صحيحة");
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new HttpError(401, "بيانات الدخول غير صحيحة");
    }

    delete user.password;
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      throw new HttpError(503, "JWT_SECRET غير مضبوط في الخادم");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  })
);

router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!result.rows.length) {
      throw new HttpError(404, "المستخدم غير موجود");
    }
    res.json(result.rows[0]);
  })
);

export default router;
