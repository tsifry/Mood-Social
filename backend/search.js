const db = require('./database');
const express = require("express");

const router = express.Router();


router.get('/', async (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) return res.json([]);

    const [users] = await db.promise().query('SELECT username FROM users WHERE username LIKE ? LIMIT 10', [`%${searchQuery}%`])

    if (users.length === 0) return res.json([]);

    res.json(users);

})

module.exports = router;