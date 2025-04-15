require('dotenv').config();

const express = require("express");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const middleware = require('./middlweare');
const db = require('../backend/database'); // already using .promise()

const router = express.Router();

// Setup Multer for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// ------------------------------------
// CREATE POST
// ------------------------------------
router.post('/create', upload.single("image"), middleware.verifyToken, async (req, res) => {
    const { song, quote, colorTheme } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    const user = req.user;

    if (!song || !quote || !colorTheme || !imagePath || !user) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        await db.query(
            'INSERT INTO posts (user_id, song_url, quote, image_url, colorTheme) VALUES (?, ?, ?, ?, ?)',
            [user.id, song, quote, imagePath, colorTheme]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ------------------------------------
// RENDER PROFILE POSTS
// ------------------------------------
router.get('/:profile', async (req, res) => {
    const { profile } = req.params;

    try {
        const userId = await middleware.getUserIdFromUsername(profile);

        if (!userId) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [results] = await db.query(
            'SELECT song_url, quote, id, colorTheme, image_url FROM posts WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        if(results.length === 0){
            return res.json({ message: "User didnt post anything yet!"});
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving posts' });
    }
});

// ------------------------------------
// DELETE POST
// ------------------------------------
router.delete('/delete/:id', middleware.verifyToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

        if (post.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await db.query('DELETE FROM posts WHERE id = ?', [postId]);
        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// ------------------------------------
// CHANGE USERNAME
// ------------------------------------
router.post('/username-change', middleware.verifyToken, async (req, res) => {
    const newUsername = req.body.username;
    const userId = req.user.id;

    if (!newUsername || newUsername.trim() === "") {
        return res.status(400).json({ success: false, message: "Please enter a valid username." });
    }

    try {
        await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, userId]);

        const user = { id: userId, username: newUsername };
        const newToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.json({ success: true, message: "Username updated." });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "Username already exists." });
        }

        console.error(err);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

// ------------------------------------
// CHANGE PROFILE PICTURE
// ------------------------------------
router.post('/upload-profile', upload.single('image'), middleware.verifyToken, async (req, res) => {
    const imagePath = "uploads/" + req.file.filename;
    const userId = req.user.id;

    try {
        const [rows] = await db.query("SELECT profile_image FROM users WHERE id = ?", [userId]);

        const currentImage = rows[0]?.profile_image;

        if (currentImage && !currentImage.includes('default.jpg')) {
            const fullPath = path.join(__dirname, "..", currentImage);
            fs.unlink(fullPath, (err) => {
                if (err) console.error('Failed to delete old image:', err);
            });
        }

        await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imagePath, userId]);

        res.json({ success: true, imagePath });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to upload image" });
    }
});

module.exports = router;

