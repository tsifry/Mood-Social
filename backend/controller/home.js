const { forYouPosts } = require("../services/home")

const getHomeFeed = async (req, res) => {
    const userId = req.user.id;
    const filter = req.query.filter;

    console.log(userId, filter)

    try {
        const posts = await forYouPosts(filter, userId);

        if (!posts.success){
            return res.status(200).json({ message: posts.message, posts: [] });
        }

        res.json(posts.posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getHomeFeed
};