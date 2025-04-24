const express = require("express")
const middleware = require('../middlweare')

const { searchBar, newFollower, renderingProfile, unfollow } = require('../controller/search')

const router = express.Router()

router.get('/', searchBar);
router.post('/follow', middleware.verifyToken, newFollower);
router.get('/follow/:profile', renderingProfile);
router.delete('/follow/:profile', middleware.verifyToken, unfollow);


module.exports = router

