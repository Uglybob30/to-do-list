import express from "express";
import { pool } from "./db.js";
import session from "express-session";
import cors from "cors";
import "dotenv/config";

import { hashPassword, comparePassword } from "./components/hash.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// IMPORTANT FOR RENDER / VERCEL
// ======================
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "https://to-do-list-7b6c.vercel.app", // your vercel URL
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,      // 🔥 REQUIRED FOR HTTPS
      sameSite: "none",  // 🔥 REQUIRED FOR CROSS DOMAIN
    },
  })
);

// ======================
// LIST ROUTES
// ======================

app.get("/get-list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM list ORDER BY id");
    res.json({ success: true, list: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/get-items/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE list_id = $1 ORDER BY id",
      [req.params.id]
    );

    res.json({ success: true, items: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/add-list", async (req, res) => {
  try {
    const { listTitle } = req.body;

    await pool.query(
      "INSERT INTO list (title, status) VALUES ($1,$2)",
      [listTitle, "pending"]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/delete-list/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM list WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// AUTH ROUTES
// ======================

app.post("/register", async (req, res) => {
  try {
    const { username, password, confirm, name } = req.body;

    if (!username || !password || !confirm || !name) {
      return res.json({ success: false, message: "Incomplete data" });
    }

    if (password !== confirm) {
      return res.json({ success: false, message: "Password not match" });
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE username=$1",
      [username]
    );

    if (exists.rows.length > 0) {
      return res.json({ success: false, message: "User exists" });
    }

    const hashed = await hashPassword(password);

    await pool.query(
      "INSERT INTO users (username,password,name) VALUES ($1,$2,$3)",
      [username, hashed, name]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false });
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.json({ success: false });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.json({ success: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/get-session", (req, res) => {
  if (req.session.user) {
    return res.json({ session: true, user: req.session.user });
  }
  res.json({ session: false });
});

app.listen(PORT, () => console.log("Server running on", PORT));
