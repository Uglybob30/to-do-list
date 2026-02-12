// server/db.js
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

// Load .env only in local development
dotenv.config();

// Check DATABASE_URL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Please set it in .env (local) or Render environment variables (production).");
}

// Create pool with SSL for Neon
export const pool = new Pool({
  connectionString: connectionString.trim(),
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

// Optional: test the connection when the server starts
pool.connect()
  .then(client => {
    console.log("✅ Connected to the database successfully!");
    client.release();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });
