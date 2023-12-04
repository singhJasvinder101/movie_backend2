const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const notificationSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new Schema({
    googleId: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: function () {
            return this.name + this.lastname;
        },
        lowercase: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        // required: true,
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    notifications: [notificationSchema],
    watchLists: {
        type: [{
            movieId: {
                type: String,
            },
            seriesId: {
                type: String,
            },
            name: String,
            imageUrl: String,
            category: {
                type: String,
            }
        }],
        default: [],
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)
module.exports = User


