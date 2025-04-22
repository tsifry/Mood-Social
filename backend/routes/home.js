const express = require("express")
const middleware = require('../middlweare');
const { getHomeFeed } = require("../controller/home.js");

const router = express.Router();

router.get('/', middleware.verifyToken, getHomeFeed);

module.exports = router;