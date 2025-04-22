const { CreatePost, RenderProfile, DeletePosts, ChangeNickname, UploadProfileImage } = require('../services/posts')

const createPost = async (req, res) => {

    const { song, quote, colorTheme } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    const user = req.user;
    
    const result = await CreatePost(song, quote, colorTheme, imagePath, user);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
    
};

const renderPost = async (req, res) => {
    const { profile } = req.params;

    const result = await RenderProfile(profile);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result.data);
    
};

const deletePosts = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    const result = await DeletePosts(postId, userId);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);

};

const changeNickname = async (req, res) => {
    const newUsername = req.body.username;
    const userId = req.user.id;

    const result = await ChangeNickname(newUsername, userId);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);

};

const uploadProfileImage = async (req, res) => {
    const imagePath = "uploads/" + req.file.filename;
    const userId = req.user.id;

    const result = await UploadProfileImage(imagePath, userId);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
};

module.exports = {
    createPost,
    renderPost,
    deletePosts,
    changeNickname,
    uploadProfileImage
};