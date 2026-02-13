// server/db.js
import "dotenv/config";  // Load .env variables
import pkg from "pg";
const { Pool } = pkg;

// Ensure all required env vars exist
const requiredVars = ["PGUSER", "PGPASSWORD", "PGHOST", "PGDATABASE", "PGPORT"];
requiredVars.forEach(v => {
  if (!process.env[v]) throw new Error(`${v} is missing in .env`);
});

export const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }  // Required for Neon
});
