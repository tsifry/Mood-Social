require('dotenv').config()

const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

async function Hashing_password(password){
    const hashed_password = await bcrypt.hash(password, 10);
    return hashed_password;
};

const CheckAuth = async (username, password) => {
    
    const [rows] = await db.query('SELECT password_hash, id FROM users WHERE username = ?', [username])
    
    if (rows.length === 0){
        return ({ success: false, message: "Incorrect credentials."});
    }
       
    const hash = rows[0].password_hash;
    const isValid = await bcrypt.compare(password, hash);
    
    if (isValid){
    
        const user = { id:rows[0].id, username };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

        return({ success: true, token: accessToken });
    
    }
    else{
        return({ success: false, message: "Incorrect credentials."})
    }

};

const Signin = async (username, password) => {

    const hashed_password = await Hashing_password(password);
    const default_image = "uploads/default.jpg";

    if (!username || !hashed_password) {
        return { success: false, message: "Missing username or password" };
    }

    try {

        await db.query(
            'INSERT INTO users (username, password_hash, profile_image) VALUES (?, ?, ?)',
            [username, hashed_password, default_image]
        );

        return { success: true, message: "User created successfully!" };

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Username already exists." };
        } else {
            console.error(err);
            return { success: false, message: "Something went wrong." };
        }
    }
};

const Authentication = async (token) => {

    if (!token) {
        return({ success: false, message: "Unauthorized" });
    }
    
    try {
        // Wrap jwt.verify in a Promise
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });
    
        const [rows] = await db.query("SELECT id, username, profile_image FROM users WHERE id = ?", [decoded.id]);
    
        if (rows.length === 0) {
            return({ success: false, message: "User not found" });
        }
    
        return({ success: true, user: rows[0] });
    
    } catch (err) {
        return({ success: false, message: "Invalid Token" });
    }
};

module.exports = {
    CheckAuth,
    Signin,
    Authentication
}