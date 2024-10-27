const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const apiRoutes = require('./routes/apiRoutes')
const cors = require('cors');
const { connectDb } = require('./config/db')
const cookieSession = require('cookie-session');

// config the things 
require('./config/passport');
require('dotenv').config()
connectDb()

// very important for google auth + normal auth jwt
// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true
// }))
// const allowedOrigins = ['https://movie-backend-eta.vercel.app', 'https://movie-frontend-six.vercel.app'];
const allowedOrigins = ['https://movie-backend2.vercel.app', 'https://series-addict.netlify.app', 'http://localhost:5173', 'http://localhost:3000'];
// const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

// important middlewares
app.use(express.json())
app.use(require('cookie-parser')());
app.use(cookieSession({
    name: 'google-auth-session',
    keys: ['kgfgfertertretrytrtyrey1']
}));


// endpoints
app.get('/', (req, res) => {
    res.send('api running..')
})


// configuring the routing to handle by routes folder
app.use('/api', apiRoutes)


app.use((error, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.log(error)
    } else {
        next(error)
    }
})

app.use((error, req, res, next) => {
    if (error && process.env.NODE_ENV === "development") {
        res.json({
            message: error.message,
            stack: error.stack
        })
    } else {
        res.json({
            message: error.message
        })
    }
})

app.listen(port, (req, res) => {
    console.log("server listening at http://localhost:3000")
})
