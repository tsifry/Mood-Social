const db = require('../backend/database');
const express = require("express");

const router = express.Router();

router.post('/create', (req, res) => {
    const post = req.body.submittedData;
    const user = req.body.user;

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

module.exports = router;