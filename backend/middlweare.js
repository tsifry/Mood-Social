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

// Decode token manually (non-middleware use)
function decodeToken(token) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    getUserIdFromUsername,
    verifyToken,
    decodeToken
};
