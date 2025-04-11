const db = require('./database');
const express = require("express");
const middleware = require('./middlweare')

const router = express.Router();

//Searchbar
router.get('/', async (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) return res.json([]);

    const [users] = await db.promise().query('SELECT username, profile_image FROM users WHERE username LIKE ? LIMIT 10', [`%${searchQuery}%`])

    if (users.length === 0) return res.json([]);

    res.json(users);

})

//Following
router.post('/follow', middleware.verifyToken, async (req, res) => {
    const profile = req.body.profile;
    const userID = req.user.id
    
    const profile_id = await middleware.getUserIdFromUsername(profile);

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

//Rendering stuff about the profile
router.get('/follow/:profile', async (req, res) => {
    const profile = req.params.profile;
    const token = req.cookies?.token; // optional chaining to avoid crashing

    const profile_id = await middleware.getUserIdFromUsername(profile);
    
    if (!profile_id) {
        return res.json({ success: false, message: "User not found" });
    }

    const [imageResult] = await db.promise().query(
        'SELECT profile_image FROM users WHERE id = ?',
        [profile_id]
    );

    const image = imageResult[0];

    // If no token, just return image
    if (!token) {
        return res.status(200).json({ success: false, message: 'Not logged in', pfp: image });
    }

    const decoded = middleware.decodeToken(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token', pfp: image });
    }

    const userID = decoded.id;

    db.query(
        'SELECT followed_id FROM follows WHERE follower_id = ? AND followed_id = ?',
        [userID, profile_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error.' });
            }
            const follows = results.length > 0;
            return res.json({ success: true, follows, pfp: image });
        }
    );
});

//unfollowing
router.delete('/follow/:profile', middleware.verifyToken, async (req, res) => {
    const profile = req.params.profile
    const userID = req.user.id

    try {

        const profile_id = await middleware.getUserIdFromUsername(profile);

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