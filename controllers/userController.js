const { hashingPassword, comparePassword } = require('../utils/HashingAndComparingPasswords')
const User = require('../models/UserModel')
const { generatingAuthToken } = require('../utils/generatingAuthToken')
const registerUser = async (req, res, next) => {
    try {
        const { name, lastname, email, password } = req.body
        if (!name && !lastname && !email && !password) {
            return res.status(400).send("All inputs are required")
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("user already exists")
        } else {
            const hashedPassword = hashingPassword(req.body.password)
            const newUser = await User.create({
                name: req.body.name,
                lastname: req.body.lastname,
                email: req.body.email.toLowerCase(),
                password: hashedPassword,
                isAdmin: req.body.isAdmin
            })
            return res.cookie("auth_token", generatingAuthToken(
                newUser._id, newUser.name, newUser.lastname, newUser.email, newUser.isAdmin, newUser.isPaid, newUser.username
            ), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
            })
                .status(201).json({
                    success: true,
                    userCreated: {
                        _id: newUser._id,
                        name: newUser.name,
                        lastname: newUser.lastname,
                        username: newUser.username,
                        email: newUser.email,
                        isAdmin: newUser.isAdmin,
                        isPaid: newUser.isPaid
                    }
                })
        }
    } catch (error) {
        next(error)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password, donotlogout } = req.body
        if (!(email && password)) {
            return res.status(400).send("All input fields are required")
        }
        const userExists = await User.findOne({ email }).orFail();
        if (userExists && comparePassword(password, userExists.password)) {
            const cookieParams = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
            }
            if (donotlogout) {
                cookieParams = { ...cookieParams, maxAge: 1000 * 60 * 60 * 24 * 7 }
            }
            // console.log("hello")
            return res.cookie('auth_token', generatingAuthToken(
                userExists._id, userExists.name, userExists.lastname, userExists.email, userExists.isAdmin, userExists.isPaid, userExists.username
            ), cookieParams)
                .json({
                    success: true,
                    userLoggedIn: {
                        _id: userExists._id,
                        name: userExists.name,
                        lastname: userExists.lastname,
                        username: userExists.username,
                        email: userExists.email,
                        isAdmin: userExists.isAdmin,
                        isPaid: userExists.isPaid,
                        donotlogout,
                    }
                })
        } else {
            return res.status(401).send("wrong credentials")
        }
    } catch (error) {
        next(error)
    }
}


const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
        return res.json({
            success: true,
            users: users
        })
    } catch (error) {
        next(error)
    }
}

const adminDeleteUser = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await User.findOneAndDelete({ _id: id })
        res.json({
            success: true,
            userDeleted: user
        })
    } catch (error) {
        next(error)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await User.findOne({ _id: id })
        return res.status(200).json({
            success: true,
            user: user
        })
    } catch (error) {
        next(error)
    }
}

const addToWatchList = async (req, res, next) => {
    try {
        const { id, category, name, imageUrl } = req.body;
        const currentUser = await User.findOne({ _id: req.user._id });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "please login",
            });
        }

        if (!currentUser.watchLists) {
            currentUser.watchLists = [];
        }

        const isDuplicate = currentUser.watchLists.some(item => item.movieId === id || item.seriesId === id);
        if (!isDuplicate) {
            if (category === "movies") {
                currentUser.watchLists.push({ movieId: id, category, name, imageUrl });
            } else {
                currentUser.watchLists.push({ seriesId: id, category, name, imageUrl });
            }
        }

        await currentUser.save();
        res.status(200).json({
            success: true,
            message: "added",
        });
    } catch (error) {
        next(error);
    }
};

const getWatchLists = async (req, res, next) => {
    try {
        const userWatchLists = await User.findOne({ _id: req.user._id })
        if (userWatchLists) {
            return res.status(200).json({
                success: true,
                watchLists: userWatchLists.watchLists
            })
        } else {
            return res.status(501).json({
                success: false
            })
        }
    } catch (error) {
        next(error)
    }
}
const removeFromWatchList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findOne({ _id: req.user._id });
        const updatedWatchlist = currentUser.watchLists.filter(item => item.movieId !== id && item.seriesId !== id);
        if (updatedWatchlist.length === currentUser.watchLists.length) {
            return res.status(404).json({
                success: false,
                message: "Item not found in watchlist"
            });
        }
        currentUser.watchLists = updatedWatchlist;
        await currentUser.save();

        res.status(200).json({
            success: true,
            message: "Item removed from watchlist"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    loginUser,
    registerUser,
    adminDeleteUser,
    getAllUsers,
    getUserById,
    addToWatchList,
    getWatchLists,
    removeFromWatchList
}
