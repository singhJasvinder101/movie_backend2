const jwt = require('jsonwebtoken');
require('dotenv').config('../../../Backend/.env')

const generatingAuthToken = (_id, name, lastname, email, isAdmin, isPaid, username) => {
    const token = jwt.sign({ _id, name, lastname, email, isAdmin, isPaid, username },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7h" }
    )
    return token
}

module.exports = {
    generatingAuthToken
}

