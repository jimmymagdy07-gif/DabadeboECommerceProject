import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// عند التشغيل من مجلد server/، الملف الفعلي للمتغيرات غالباً في dabadibo/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false,
});
