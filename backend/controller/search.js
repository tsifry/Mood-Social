const { SearchBar, NewFollower, RenderingProfile, Unfollow } = require("../services/search");

const searchBar = async (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) return res.json([]);

    const users = await SearchBar(searchQuery);

    if (users.length === 0) return res.json([]);

    res.json(users);

}

const newFollower = async (req, res) => {
    const profile = req.body.profile;
    const userID = req.user.id;

    const result = await NewFollower(profile, userID);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

const renderingProfile = async (req, res) => {
    const profile = req.params.profile;
    const token = req.cookies?.token; // optional chaining to avoid crashing

    const result = await RenderingProfile(profile, token);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

unfollow = async (req, res) => {
    const profile = req.params.profile;
    const userID = req.user.id;

    const result = await Unfollow(profile, userID);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

module.exports = {
    searchBar,
    newFollower,
    renderingProfile,
    unfollow
};