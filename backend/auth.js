require('dotenv').config()

const db = require('../backend/database');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");

const router = express.Router();

async function Hashing_password(password){
    const hashed_password = await bcrypt.hash(password, 10);
    return hashed_password;
}

//Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.query('SELECT password_hash, id FROM users WHERE username = ?', [username])

    if (rows.length === 0){
        return res.json({ success: false, message: "Incorrect credentials."});
    }
   
    const hash = rows[0].password_hash;
    const isValid = await bcrypt.compare(password, hash);

    if (isValid){

        const user = { id:rows[0].id, username };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

        res.cookie("token", accessToken, {httpOnly: true, secure: process.env.NODE_ENV === "production",
                                          sameSite: "strict",
        });

        res.json({ success: true });

    }
    else{
        res.json({ success: false, message: "Incorrect credentials."})
    }

});

//Sign in
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const hashed_password = await Hashing_password(password);
    const default_image = "uploads/default.jpg";

    if (username && hashed_password){
        db.query('INSERT INTO users (username, password_hash, profile_image) VALUES (?, ?, ?)', [username, hashed_password, default_image])
        .then(() => res.json({ success: true, message: "User created successfully!"}))
        .catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                res.json({ success: false, message: "Username already exists." });
            } else {
                console.log(err);
                res.status(500).json({ success: false, message: "idk tbh" });
            }
        });
    }

});

//Log out
router.post('/logout', async (req, res) => {
    res.cookie("token", "", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        expires: new Date(0) // Expire immediately
    });
    res.json({ success: true, message: "Logged out successfully." });
})

//Auth
router.get('/me', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({ success: false, message: "Unauthorized" });
    }

    try {
        // Wrap jwt.verify in a Promise
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });

        const [rows] = await db.query("SELECT id, username, profile_image FROM users WHERE id = ?", [decoded.id]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user: rows[0] });

    } catch (err) {
        return res.json({ success: false, message: "Invalid Token" });
    }
});

module.exports = router;