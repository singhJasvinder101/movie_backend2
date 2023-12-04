const passport = require('passport');
const { authenticateJWT } = require('../middlewares/VerifyAuthToken');

const router = require('express').Router();
require('dotenv').config()

router.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: '/login/failed'
    })
)
router.get('/login/failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: "Login Failure"
    })
})

router.get('/login/success', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Successfully Logged In",
        user: req.user
    })
})

router.get('/google', passport.authenticate("google", ["profile", "email"]))

router.get('/get-token', authenticateJWT, (req, res) => {
    
    res.json({
        token: req.user.name, user: {
            _id: req.user._id,
            name: req.user.name,
            googleid: req.user.googleId,
            lastname: req.user.lastname,
            username: req.user.username,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            isPaid: req.user.isPaid
        }
    });
})

router.get("/logout", (req, res) => {
    req.logout();
    // res.redirect(process.env.CLIENT_URL);
    res.clearCookie("auth_token").send("access token cleared")
});

module.exports = router