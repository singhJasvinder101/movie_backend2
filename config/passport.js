const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/UserModel");
const passport = require("passport")
require('dotenv').config()


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://movie-backend-eta.vercel.app/auth/google/callback",
    passReqToCallback: true,
    scope: ["profile", "email"]
},
    async (request, accessToken, refreshToken, profile, done) => {
        // done(null, profile)
        let auth_token = accessToken
        try {
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                if (existingUser) {
                    const maxAge = 24 * 60 * 60 * 1000;
                    request.res.cookie('auth_token', auth_token, {
                        maxAge,
                        httpOnly: true,
                        sameSite: "none",
                        secure: true,
                    });

                    return done(null, existingUser);
                }
            }

            const newUser = new User({
                googleId: profile.id,
                name: profile.name.givenName,
                lastname: profile.name.familyName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });

            await newUser.save();
            const maxAge = 24 * 60 * 60 * 1000;
            request.res.cookie('auth_token', auth_token, {
                maxAge,
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });

            // Return the newly created user
            setTimeout(() => {
                done(null, newUser);
            }, 100);
        } catch (error) {
            console.log(error);
            done(error, null);
        }
    }
));
passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser((user, done) => {
    done(null, user);
})


