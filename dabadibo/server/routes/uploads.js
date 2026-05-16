import { Router } from "express";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post(
  "/product-images",
  authenticateToken,
  isAdmin,
  (req, res, next) => {
    uploadProductImages.array("files", 12)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "فشل الرفع" });
      }
      next();
    });
  },
  asyncHandler((req, res) => {
    const urls = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
    res.status(201).json({ urls });
  })
);

export default router;
