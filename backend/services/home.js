const db = require('../database');

async function getProfileInfo(post) {

    let profile_id = [];
    const post_info = [];

    for (let i = 0; i < post.length; i++){
        profile_id.push(post[i].user_id);
    }

    profile_id = [...new Set(profile_id)]

    const [user] =  await db.query(
        'SELECT id, username, profile_image FROM users WHERE id IN (?)', [profile_id]);

    return [user, post];
}

const forYouPosts = async () => {
    
    try {
        const [results] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    
         const posts = await getProfileInfo(results);
    
        return posts;
    
        } catch (err) {
            console.error(err);
            return("failed");
        }  
};

module.exports = {
    forYouPosts
};