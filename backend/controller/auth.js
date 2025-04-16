const { CheckAuth, Signin, Authentication } = require('../services/auth')

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await CheckAuth(username, password);

        if (result.success) {
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            res.json({ success: true });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

const logout = async (req, res) => {
    res.cookie("token", "", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        expires: new Date(0) // Expire immediately
    });
    res.json({ success: true, message: "Logged out successfully." });
};

const signin = async (req, res) => {
    const { username, password } = req.body;

    try {

        const result = await Signin(username, password);

        if (result.success){
            res.json({ success: true, message: result.message})
        } else{
            res.json({ success: false, message: result.message})
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error."})
    }
};

const auth = async (req, res) => {
    const token = req.cookies.token;

    try {
        const result = await Authentication(token);

        if (result.success){
            res.json({ success: true, user: result.user })
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error." });
    }

};

module.exports = {
    login,
    logout,
    signin,
    auth
};