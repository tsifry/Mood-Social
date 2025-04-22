const express = require("express")

const { createPost, renderPost, deletePosts, changeNickname, uploadProfileImage } = require("../controller/posts")
const middleware = require('../middlweare');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const router = express.Router();

router.post('/create', middleware.verifyToken, upload.single("image"), createPost);
router.get('/:profile', renderPost);
router.delete('/delete/:id', middleware.verifyToken, deletePosts);
router.post('/username-change', middleware.verifyToken, changeNickname);
router.post('/upload-profile', middleware.verifyToken, upload.single('image'), uploadProfileImage);


module.exports = router;