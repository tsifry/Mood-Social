require('dotenv').config()

const db = require('../backend/database');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");

const router = express.Router();

async function Hashing_password(password){
    const hashed_password = await bcrypt.hash(password, 10);
    return hashed_password;
}

router.get('/', (req, res) => {
    res.status(200).send({
        tshirt: 'blabla', 
        size: 'large'}) 
}) 

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.promise().query('SELECT password_hash, id FROM users WHERE username = ?', [username])

    if (rows.length === 0){
        return res.json({ success: false, message: "Incorrect credentials"});
    }
   
    const hash = rows[0].password_hash;
    const isValid = await bcrypt.compare(password, hash);

    if (isValid){

        const user = { id:rows[0].id, username };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        console.log(user)

        res.cookie("token", accessToken, {httpOnly: true, secure: process.env.NODE_ENV = "production",
                                          sameSite: "strict",
        });

        res.json({ success: true });

    }
    else{
        res.json({ success: false, message: "Incorrect credentials."})
    }

});

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const hashed_password = await Hashing_password(password);

    if (username && hashed_password){
        db.promise().query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashed_password])
        .then(() => res.json({ success: true, message: "User created successfully!"}))
        .catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                res.json({ success: false, message: "Username already exists." });
            } else {
                res.status(500).json({ success: false, message: "idk tbh" });
            }
        });
    }

});

router.get('/me', (req, res) => {
    const token = req.cookies.token;

    if (!token){
        return res.json({ success: false, message: "Unauthorized" })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.json({ success: false, message: "Invalid Token" })
        }
        res.json({ success: true, user });
    })

})

module.exports = router;