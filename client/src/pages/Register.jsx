import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js"; // your Neon connection

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.json({
        success: false,
        message: "Missing fields",
      });
    }

    // check if username exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: false,
        message: "Username already exists",
      });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert user into NeonDB
    await pool.query(
      "INSERT INTO users (name, username, password) VALUES ($1,$2,$3)",
      [name, username, hashed]
    );

    res.json({
      success: true,
      message: "Registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
