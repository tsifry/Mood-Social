const { CanUserPost, CreatePost, Report, RenderPosts, DeletePosts, ChangeNickname, UploadProfileImage, ToggleLikeService } = require('../services/posts')
const middleware = require('../middlweare');

const createPost = async (req, res) => {
    const { song, quote, colorTheme } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    const user = req.user;

    if (!song || !quote || !colorTheme) {
        if (imagePath) {
            const fullPath = path.resolve(__dirname, "..", imagePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        return res.status(400).json({ success: false, message: 'Missing song, quote or colorTheme' });
    }


    const trimmedQuote = quote.trim();
    if (trimmedQuote.length < 5 || trimmedQuote.length > 200) {
        return res.status(400).json({ success: false, message: 'Quote must be between 5 and 200 characters.' });
    }

    const { allowed, timeLeft } = await  middleware.canUserPost(user.id);

    if (!allowed) {
        return res.status(400).json({ success: false, message: `You can only post every 24 hours. Please wait ${Math.ceil(timeLeft)} Hours.`, timeLeft: timeLeft });
    }

    const result = await CreatePost(song, quote, colorTheme, imagePath, user);
    
    if (!result.success) {
        if (imagePath) {
            const fullPath = path.resolve(__dirname, "..", imagePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        return res.status(400).json(result);
    }

    res.json(result);
    
};

const renderPost = async (req, res) => {
    const { profile, filter, page } = req.query;
    const userId = req.user?.id;

    const result = await RenderPosts(filter, userId, profile, page);

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

    const trimmedUsername = newUsername.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
        return res.status(400).json({ success: false, message: 'Username must be between 3 and 20 characters.' });
    }

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

const toggleLikeController = async (req, res) => {
    const { post_id } = req.body;
    const user = req.user;

    if (!post_id || !user) {
        return res.status(400).json({ success: false, message: 'Missing post_id or user' });
    }

    const result = await ToggleLikeService(post_id, user.id);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
};

const report = async (req, res) =>{
    const { postId, message } = req.body;

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5 || trimmedMessage.length > 200) {
        return res.status(400).json({ success: false, message: 'Message must be between 5 and 200 characters.' });
    }

    if (!postId || !message) {
        return res.status(400).json({ success: false, message: 'Missing postId or message' });
    }

    const result = await Report(postId, req.user.id, message);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

module.exports = {
    createPost,
    renderPost,
    deletePosts,
    changeNickname,
    uploadProfileImage,
    toggleLikeController,
    report
};