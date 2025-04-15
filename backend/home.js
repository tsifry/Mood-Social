const db = require('../backend/database');
const express = require("express");

const router = express.Router();

async function getProfileInfo(post) {

    let profile_id = [];
    const post_info = [];

    for (let i = 0; i < post.length; i++){
        profile_id.push(post[i].user_id);
    }

    profile_id = [...new Set(profile_id)]

    const [user, fields] =  await db.query('SELECT id, username, profile_image FROM users WHERE id IN (?)', [profile_id]);

    return [user, post];
}

router.get('/', async (req, res) => {
  
    try {
        const [results] = await db.query('SELECT * FROM posts');

        const posts = await getProfileInfo(results);

        res.json(posts);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving posts' });
    }     
})


module.exports = router;
