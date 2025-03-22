const db = require('../backend/database');
const bcrypt = require('bcrypt');
const express = require('express');

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

    const [rows] = await db.promise().query('SELECT password_hash FROM users WHERE username = ?', [username])

    if (rows.length === 0){
        return res.json({ success: false, message: "Incorrect credentials"});
    }
   
    const hash = rows[0].password_hash;
    const isValid = await bcrypt.compare(password, hash);

    if (isValid){
        res.json({ success: true})
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

module.exports = router;