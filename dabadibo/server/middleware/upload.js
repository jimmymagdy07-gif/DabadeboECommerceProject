import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, "..", "uploads", "products");

fs.mkdirSync(productsDir, { recursive: true });

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExt.has(ext)) {
      return cb(new Error("امتداد الملف غير مسموح"));
    }
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, name);
  },
});

function fileFilter(_req, file, cb) {
  if (allowedMime.has(file.mimetype) && allowedExt.has(path.extname(file.originalname || "").toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("نوع الملف غير مسموح (صور فقط: jpg, png, webp, gif)"));
  }
}

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
});
