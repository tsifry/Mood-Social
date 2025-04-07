require('dotenv').config()

const db = require('../backend/database');
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')

const router = express.Router();

async function getUserIdFromUsername(username){
    
    const [rows] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username])

    if (rows.length === 0){
        return false;
    }

    const id = rows[0].id;
    
    return id;

}

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
    
        // Add user info to the request (e.g., user ID)
        req.user = decoded;  // `decoded` contains the payload, e.g., { id: 1, username: 'user1' }
    
        next(); // Proceed to the next middleware or route handler
    });

}

router.post('/create', verifyToken, (req, res) => {
    const post = req.body.submittedData;
    const user = req.user;

    if (!post.song || !post.quote){
        res.json({ success: false });
    }

    if (!user){
        res.json({ success: false });
    }

    db.promise().query('INSERT INTO posts (user_id, song_url, quote) VALUES (?, ?, ?)', [user.id, post.song, post.quote])
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.log(err);
            res.status(500).json({ success: false, message: "Database error" });
        });
});

router.get('/:profile', async (req, res) => {
    const { profile } = req.params;

    try{
        const userId = await getUserIdFromUsername(profile);
        
        if (!userId) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.query('SELECT song_url, quote, id FROM posts WHERE user_id = ?', [userId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error retrieving posts' }); 
            }
            
            res.json(results);
        })
    } catch (error) {
        return res.status(404).json({ message : "Error 404 " + error})
    }
});

router.delete('/delete/:id',  verifyToken, async (req, res) =>{
    const postId = req.params.id;
    const userId = req.user.id;

    try {

        const [post] = await db.promise().query('SELECT * FROM posts WHERE id = ?', [postId]);

        if (post.length === 0){
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post[0].user_id != userId ){
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await db.promise().query('DELETE FROM posts WHERE id = ?', [postId]);
        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post' });
    }

});

router.post('/username-change', verifyToken, async (req, res) => {
    const new_username = req.body.username;
    const userId = req.user.id;

    if (!new_username || !userId ){
        res.json({ success: false, message: "Not authorized." })
    }

    try {
        await db.promise().query('UPDATE users SET username = ? WHERE id = ?', [new_username, userId])
        
        const user = { id: userId, username: new_username };
        const newToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

        res.cookie("token", newToken, {   
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict"
        });

        res.json({ success: true, message: "Nickname updated." });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.json({ success: false, message: "Username already exists." });
        } else {
            console.log(err);
            return res.status(500).json({ success: false, message: "Error trying to update username, try again later." });
        }
    }

});

module.exports = router;