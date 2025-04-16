const express = require("express")
const { getHomeFeed } = require("../controller/home.js");

const router = express.Router();

router.get('/', getHomeFeed);

module.exports = router;