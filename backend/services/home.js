const db = require('../database');
const middleware = require('../middlweare');

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

const forYouPosts = async (filter, userId) => {
    
    try {

        let results;
        
        if (filter === "Following"){
            [results] = await db.query(`SELECT p.* FROM posts p JOIN follows f ON p.user_id = f.followed_id WHERE f.follower_id = ? ORDER BY p.created_at DESC`, [userId]);

            if (results.length === 0) {
                return { success: false, message: "You don't follow any profiles yet!" };
            }
        }

        else if (filter === "Profile"){

            const userId = await middleware.getUserIdFromUsername(profile);
                
            if (!userId) {
                return ({ success: false, message: 'User not found' });
            }
                
            [results] = await db.query(
                'SELECT song_url, quote, id, colorTheme, image_url, like_count FROM posts WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
                
            if(results.length === 0){
                return ({ success: false, message: "User didnt post anything yet!"});
            }

        }

        else {
            [results] = await db.query(`SELECT * FROM posts ORDER BY created_at DESC`);
        }

        const posts = await getProfileInfo(results);
        return {success: true, posts};
    
        } catch (err) {
            console.error(err);
            return { success: false, message: "Failed to fetch posts." };
        }  
};

module.exports = {
    forYouPosts
};