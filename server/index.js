import express from 'express';
import { pool } from './db.js';
import bcrypt from 'bcryptjs';
import { hashPassword, comparePassword } from './components/hash.js';
import session from 'express-session';
import "dotenv/config";


const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
    session({
        secret: 'mySecretKey',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

app.get('/get-list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM list ORDER BY id');
        res.status(200).json({ success: true, list: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/get-items/:id', async (req, res) => {
    try {
        const listId = req.params.id;
        const result = await pool.query(
            'SELECT * FROM items WHERE list_id = $1 ORDER BY id',
            [listId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ success: false, message: "Awan listaan nong!" });
        }

        res.status(200).json({ success: true, items: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/add-list', async (req, res) => {
    try {
        const { listTitle } = req.body;
        if (!listTitle) {
            return res.status(400).json({ success: false, message: "List title required" });
        }

        await pool.query(
            'INSERT INTO list (title, status) VALUES ($1, $2)',
            [listTitle, 'pending']
        );

        res.status(200).json({
            success: true,
            message: "Successfully added, Gimasen gayyem nag nanam"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/delete-list/:id', async (req, res) => {
    try {
        const listId = req.params.id;
        await pool.query('DELETE FROM list WHERE id = $1', [listId]);
        res.status(200).json({ success: true, message: "List deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password, confirm, name } = req.body;

        if (!username || !password || !confirm || !name) {
            return res.status(400).json({ success: false, message: "Incomplete data" });
        }

        if (password !== confirm) {
            return res.status(400).json({ success: false, message: "Password not match" });
        }

        const exists = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);

        await pool.query(
            'INSERT INTO users (username, password, name) VALUES ($1, $2, $3)',
            [username, hashedPassword, name]
        );

        res.status(200).json({ success: true, message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Incomplete data" });
        }

        const result = await pool.query(
            'SELECT id, username, password, name FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid username or password" });
        }

        const user = result.rows[0];

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid username or password" });
        }

        // Include username in session for /get-session
        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name
        };

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});


app.get('/get-session', (req, res) => {
    if (req.session.user) {
        return res.status(200).json({
            session: true,
            user: {
                id: req.session.user.id,
                username: req.session.user.username,
                name: req.session.user.name
            }
        });
    }

    res.status(200).json({ session: false });
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
