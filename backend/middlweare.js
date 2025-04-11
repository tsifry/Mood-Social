import db from './database.js'
import jwt from 'jsonwebtoken';

export async function getUserIdFromUsername(username){
    
    const [rows] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username])

    if (rows.length === 0){
        return false;
    }

    const id = rows[0].id;
    
    return id;

}

export const verifyToken = (req, res, next) => {
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

export function decodeToken(token) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}
