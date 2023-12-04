// Check if the user is logged in with Google OAuth or JWT
const jwt = require('jsonwebtoken')
require('dotenv').config()


const verifyIsLoggedIn = (req, res, next) => {
    // User is logged in with JWT authentication
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(403).send("A token is required for authentication")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decoded
        // const user = decoded;
        // return res.status(200).json({ success: true, message: 'User is logged in with JWT authentication', user });
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'User is not logged in' });
    }

};


const verifyIsAdmin = async (req, res, next) => {
    try {
        if (req.user && req.user.isAdmin) {
            next()
        } else {
            return res.status(401).send("Unauthorized. Admin required")
        }
    } catch (err) {
        next(err)
    }
}

function authenticateJWT(req, res, next) {
    if (req.isAuthenticated()) {
        // User is logged in with Google OAuth
        next()
    } else {
        const accessToken = req.cookies.auth_token;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // } catch (jwtError) {
        //     // The token is not a JWT token, try verifying it as a Google OAuth token
        //     axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
        //     .then((response) => {
        //         const tokenInfo = response.data;
        //         if (tokenInfo.aud === process.env.CLIENT_ID) {
        //                 // The token is valid and belongs to your app
        //                 req.user = { name: tokenInfo.name, email: tokenInfo.email };
        //                 return next();
        //             } else {
        //                 // The token does not belong to your app
        //                 return res.status(401).json({ message: "Unauthorized" });
        //             }
        //         })
        //         .catch((googleError) => {
        //             // Handle errors, e.g., token expired or invalid
        //             return res.status(401).json({ message: "Token expired or invalid" });
        //         });
        // }
    }
}


module.exports = {
    verifyIsLoggedIn, verifyIsAdmin, authenticateJWT
}