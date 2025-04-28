const db = require('../database');
const middleware = require('../middlweare');

const SearchBar = async (query) => {

    if (!query) return {success: false};

    const [results] = await db.query(
        'SELECT username, profile_image FROM users WHERE username LIKE ? LIMIT 10',
        [`%${query}%`]
    );

    if (results.length === 0) return [];

    return results;
};

const NewFollower = async (profile, userID) => {
    
    if (!profile || !userID) return {success: false, message: "Missing fields"};

    const profile_id = await middleware.getUserIdFromUsername(profile);

    if (!profile_id) return {success: false, message: "User not found"};

    await db.query('INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)', [userID, profile_id])
    return { success: true };
        
};

const RenderingProfile = async (profile, token) => {

    try{

        // Get profile ID from username
        const profile_id = await middleware.getUserIdFromUsername(profile);

        if (!profile_id) {
            return { success: false, message: "User not found" };
        }

        // Get profile image for the user
        const [imageResult] = await db.query(
            'SELECT profile_image FROM users WHERE id = ?',
            [profile_id]
        );

        const image = imageResult[0];

        // If no token, just return image
        if (!token) {
            return({ success: false, message: 'Not logged in', pfp: image });
        }

        const decoded = middleware.decodeToken(token);

        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid token', pfp: image });
        }

        const userID = decoded.id;
        const allowedToPost = await middleware.canUserPost(userID);

        // Check if the user follows the profile
        const [followResults] = await db.query(
            'SELECT followed_id FROM follows WHERE follower_id = ? AND followed_id = ?',
             [userID, profile_id]
        );
        
        const follows = followResults.length > 0;

        // Send the response with the follow status and profile image
        return({ success: true, follows, pfp: image, allowedToPost });

    } catch (err) {
        console.log(err);
        return { success: false, message: "Database error" };
    }
}

const Unfollow = async (profile, userID) => {

    if (!profile || !userID) return {success: false, message: "Missing fields"};

    const profile_id = await middleware.getUserIdFromUsername(profile);

    if (!profile_id) return {success: false, message: "User not found"};

    await db.query('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?', [userID, profile_id])
    return { success: true };
};

module.exports = {
    SearchBar,
    NewFollower,
    RenderingProfile,
    Unfollow
};