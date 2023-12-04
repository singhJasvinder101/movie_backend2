const express = require('express')
const app = express.Router()
const userRoutes = require('./usersRoutes')
const { authenticateJWT } = require('../middlewares/VerifyAuthToken')
const jwt = require("jsonwebtoken")

app.get('/', (req, res) => {
    res.send('/api routes also working')
})

app.get("/get-token", (req, res) => {
    try {
        const accessToken = req.cookies.auth_token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        res.json({ token: decoded.name, isAdmin: decoded.isAdmin });
    } catch (err) {
        res.status(401).send(err);
    }
})
app.get("/logout", (req, res) => {
    return res.clearCookie("auth_token").send("access token cleared");
})

app.use('/users', userRoutes)

module.exports = app
