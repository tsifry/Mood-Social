const db = require('./database');
const jwt = require('jsonwebtoken');

// Get user ID from username
async function getUserIdFromUsername(username) {
    try {
        const [rows] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error fetching user ID:', error);
        return null;
    }
}

// Middleware to verify JWT token from cookies
function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Payload: { id, username }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

function optionalAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Payload: { id, username }
        return next();
        
    } catch (err) {
        return next();
    }

}

// Decode token manually (non-middleware use)
function decodeToken(token) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

async function canUserPost (userId){
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

module.exports = {
    getUserIdFromUsername,
    verifyToken,
    optionalAuth,
    decodeToken,
    canUserPost
};
