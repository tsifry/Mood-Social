const db = require('./database');
const express = require("express");
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

//Searchbar
router.get('/', async (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) return res.json([]);

    const [users] = await db.promise().query('SELECT username, profile_image FROM users WHERE username LIKE ? LIMIT 10', [`%${searchQuery}%`])

    if (users.length === 0) return res.json([]);

    res.json(users);

})

//Following
router.post('/follow', verifyToken, async (req, res) => {
    const profile = req.body.profile;
    const userID = req.user.id
    
    const profile_id = await getUserIdFromUsername(profile);

    if (!profile || !profile_id ) {
        res.json({success: false})
    } 
    
    db.promise().query('INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)', [userID, profile_id])
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.log(err);
            res.status(500).json({ success: false, message: "Database error" });
        });
});

//Rendering if follows
router.get('/follow/:profile', verifyToken, async (req, res) => {
    const profile = req.params.profile
    const userID = req.user.id

    try {

        const profile_id = await getUserIdFromUsername(profile);

        db.query('SELECT followed_id FROM follows WHERE follower_id = ? AND followed_id = ?', [userID, profile_id], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error.' });
            }
            if (results.length > 0) {
                return res.json({ success: true, follows: true });
            } else {
                return res.json({ success: true, follows: false });
            }
        })

    }  catch (err) {

        return res.status(400).json({ success: false, message: 'Invalid username.' });

    }
})

//unfollowing
router.delete('/follow/:profile', verifyToken, async (req, res) => {
    const profile = req.params.profile
    const userID = req.user.id

    try {

        const profile_id = await getUserIdFromUsername(profile);

        if (!profile || !profile_id )
            res.json({success: false})

        else if ( !userID ){
            res.json({success: false})
        }
        else{
           
            await db.promise().query('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?', [userID, profile_id]);
            res.status(200).json({ success: true, message: 'Post deleted successfully' });
        }

    }  catch (err) {

        return res.status(400).json({ success: false });

    }
})

module.exports = router;