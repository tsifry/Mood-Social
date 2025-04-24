const fs = require('fs');
const path = require('path');
const db = require('../database');
const jwt = require('jsonwebtoken');
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

const CanUserPost = async (userId) => {
    const [lastPost] = await db.query(
        'SELECT created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
    );

    if (lastPost.length === 0) return { allowed: true };

    const lastPostTime = new Date(lastPost[0].created_at);
    const now = new Date();
    const diffInHours = (now - lastPostTime) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return {
            allowed: false,
            timeLeft: 24 - diffInHours,
        };
    }

    return { allowed: true };
};

const CreatePost = async (song, quote, colorTheme, imagePath, user) => {

    if (!song || !quote || !colorTheme || !imagePath || !user) {
        return ({ success: false, message: "Missing fields" });
    }

    try {
        await db.query(
            'INSERT INTO posts (user_id, song_url, quote, image_url, colorTheme) VALUES (?, ?, ?, ?, ?)',
            [user.id, song, quote, imagePath, colorTheme]
        );
        
        return({ success: true });

    } catch (err) {
        console.error(err);
        return({ success: false, message: "Database error" });
    }
};

const RenderPosts = async (filter, userId, profile) => {

    try {
            const ProfileId = await middleware.getUserIdFromUsername(profile);
            let results;

            //So, if the render posts are from a PROFILE:
            if (profile){

                if (!ProfileId) {
                    return ({ success: false, message: 'User not found' });
                }

                [results] = await db.query(
                    'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
                    [ProfileId]
                );

                if(results.length === 0){
                    return ({ success: false, message: "User didnt post anything yet!"});
                }

            }

            //If posts are in the HOME PAGE, but in the FOLLOWING filter:
            else if (filter === "Following"){

                if(!userId){
                    
                }

                [results] = await db.query(`SELECT p.* FROM posts p JOIN follows f ON p.user_id = f.followed_id WHERE f.follower_id = ? ORDER BY p.created_at DESC`, [userId]);
            
                if (results.length === 0) {
                    return { success: false, message: "You don't follow any profiles yet!" };
                }
            }

            else {
                [results] = await db.query(`SELECT * FROM posts ORDER BY created_at DESC`);
            }

            
            const posts = await getProfileInfo(results);
            return { success: true, data: posts };
    
    } catch (error) {
        console.error(error);
        return ({ success: false, message: 'Error retrieving posts' });
    }
};

const DeletePosts = async (postId, userId) => {

    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
        if (post.length === 0) {
            return ({ success: false, message: 'Post not found' });
        }
    
        if (post[0].user_id !== userId) {
            return ({ success: false, message: 'Unauthorized to delete this post' });
        }

        const imagePath = post[0].image_url;

        if (imagePath) {
            const fullPath = path.resolve(__dirname, "..", imagePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error('Failed to delete post image:', err);
                }
            });
        }
    
        await db.query('DELETE FROM posts WHERE id = ?', [postId]);

        return({ success: true, message: 'Post deleted successfully' });
    
    } catch (error) {
        console.error(error);
        return({ success: false, message: 'Error deleting post' });
    }
};

const ChangeNickname = async (newUsername, userId) => {

    if (!newUsername || newUsername.trim() === "") {
        return ({ success: false, message: "Please enter a valid username." });
    }
    
    try {
        await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, userId]);
    
        const user = { id: userId, username: newUsername };
        const newToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    
        return({ success: true, message: "Username updated.", token: newToken });
    
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return ({ success: false, message: "Username already exists." });
        }
    
        console.error(err);
         return ({ success: false, message: "Database error" });
    }
};

const UploadProfileImage = async (imagePath, userId) => {

    try {
        const [rows] = await db.query("SELECT profile_image FROM users WHERE id = ?", [userId]);
    
        const currentImage = rows[0]?.profile_image;
    
        if (currentImage && !currentImage.includes('default.jpg')) {
            const fullPath = path.resolve(__dirname, "..", imagePath);
            fs.unlink(fullPath, (err) => {
                    if (err) console.error('Failed to delete old image:', err);
            });
        }
    
        await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imagePath, userId]);
    
        return({ success: true, imagePath });
    
    } catch (err) {
        console.error(err);
        return({ success: false, message: "Failed to upload image" });
    }
};

const ToggleLikeService = async (post_id, user_id) => {
    try {
        // Check if already liked
        const [existing] = await db.query(
            'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
            [post_id, user_id]
        );

        if (existing.length > 0) {
            // Dislike (remove like)
            await db.query(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [post_id, user_id]
            );

            await db.query(
                'UPDATE posts SET like_count = like_count - 1 WHERE id = ?',
                [post_id]
            );

            return { success: true, liked: false };
        } else {
            // Like
            await db.query(
                'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                [post_id, user_id]
            );

            await db.query(
                'UPDATE posts SET like_count = like_count + 1 WHERE id = ?',
                [post_id]
            );

            return { success: true, liked: true };
        }

    } catch (err) {
        console.error(err);
        return { success: false, message: 'Database error' };
    }
};

const Report = async (postId, userId, message) => {
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
        if (post.length === 0) {
            return ({ success: false, message: 'Post not found' });
        }
    
        if (post[0].user_id === userId) {
            return ({ success: false, message: 'You cannot report your own post' });
        }
    
        await db.query('INSERT INTO reports (post_id, user_id, message) VALUES (?, ?, ?)', [postId, userId, message]);
    
        return({ success: true, message: 'Post reported successfully' });
    
    } catch (error) {
        console.error(error);
        return({ success: false, message: 'Error reporting post' });
    }
};

module.exports = {
    CreatePost,
    RenderPosts,
    DeletePosts,
    ChangeNickname,
    UploadProfileImage,
    ToggleLikeService,
    Report,
    CanUserPost
}