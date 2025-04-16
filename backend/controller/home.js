const { forYouPosts } = require("../services/home")

const getHomeFeed = async (req, res) => {
    try {
        const posts = await forYouPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getHomeFeed
};