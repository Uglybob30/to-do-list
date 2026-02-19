// server/index.js
import "dotenv/config";
import express from "express";
import { pool } from "./db.js";
import session from "express-session";
import cors from "cors";
import { hashPassword, comparePassword } from "./components/hash.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// CORS CONFIG
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://to-do-list-three-alpha-83.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: The origin ${origin} is not allowed`), false);
    },
    credentials: true, // allow cookies
  })
);

// ======================
// HANDLE PRE-FLIGHT OPTIONS
// ======================
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204); // No Content
  }
  next();
});

// ======================
// BODY PARSING
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION CONFIG
// ======================
app.set("trust proxy", 1); // needed behind proxies like Render

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only
      sameSite: "none", // cross-origin cookies
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ======================
// TEST DB CONNECTION
// ======================
pool.query("SELECT NOW()")
  .then(res => console.log("✅ DB connected:", res.rows[0]))
  .catch(err => console.error("❌ DB connection error:", err));

app.use((req, res, next) => {
  console.log("Incoming request from origin:", req.headers.origin);
  next();
});

// ======================
// AUTH ROUTES
// ======================
app.post("/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    const exists = await pool.query("SELECT id FROM users WHERE username=$1", [username]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, message: "User already exists" });

    const hashed = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (username, password, name) VALUES ($1,$2,$3) RETURNING id, username, name",
      [username, hashed, name]
    );

    req.session.user = result.rows[0];
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", {
      path: "/",
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ success: true });
  });
});

app.get("/get-session", (req, res) => {
  if (req.session.user) return res.json({ session: true, user: req.session.user });
  res.json({ session: false });
});

// ======================
// LIST ROUTES
// ======================
app.get("/get-list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM list ORDER BY created_at DESC");
    res.json({ success: true, list: result.rows });
  } catch (err) {
    console.error("GET LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/add-list", async (req, res) => {
  try {
    const { listTitle } = req.body;
    if (!listTitle || listTitle.trim() === "")
      return res.status(400).json({ success: false, message: "List title required" });

    const result = await pool.query(
      "INSERT INTO list (title) VALUES ($1) RETURNING *",
      [listTitle]
    );
    res.json({ success: true, list: result.rows[0] });
  } catch (err) {
    console.error("ADD LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/delete-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM list WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/update-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { listTitle } = req.body;

    if (!listTitle || listTitle.trim() === "")
      return res.status(400).json({ success: false, message: "List title cannot be empty" });

    const result = await pool.query(
      "UPDATE list SET title=$1 WHERE id=$2 RETURNING *",
      [listTitle, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "List not found" });

    res.json({ success: true, list: result.rows[0] });
  } catch (err) {
    console.error("UPDATE LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ======================
// ITEM ROUTES
// ======================
app.get("/get-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM items WHERE list_id=$1 ORDER BY created_at",
      [id]
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error("GET ITEMS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/add-item", async (req, res) => {
  try {
    const { listId, description } = req.body;
    if (!listId || !description || description.trim() === "")
      return res.status(400).json({ success: false, message: "Missing listId or description" });

    const result = await pool.query(
      "INSERT INTO items (list_id, description) VALUES ($1,$2) RETURNING *",
      [listId, description]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/delete-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ITEM ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/update-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status } = req.body;

    if (!description && status === undefined)
      return res.status(400).json({ success: false, message: "Nothing to update" });

    const updates = [];
    const params = [];
    let idx = 1;

    if (description) {
      updates.push(`description=$${idx}`);
      params.push(description);
      idx++;
    }

    if (status !== undefined) {
      updates.push(`status=$${idx}`);
      params.push(status);
      idx++;
    }

    params.push(id);
    const query = `UPDATE items SET ${updates.join(", ")} WHERE id=$${idx} RETURNING *`;
    const result = await pool.query(query, params);

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
