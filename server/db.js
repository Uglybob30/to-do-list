// server/db.js
import "dotenv/config";  // <-- ensure env vars loaded
import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL.trim(),
  ssl: { rejectUnauthorized: false },
});
