const express = require("express")
const { login, logout, auth, signin } = require('../controller/auth.js');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/signin', signin);
router.get('/me', auth);

module.exports = router;