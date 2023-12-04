const Movie = require('../models/MoviesModel')
const { fetchAndStoreMovies } = require('../seeders/moviesSeeder')
require('dotenv').config({ path: '../.env' })
const { connectDb } = require('../config/db')
connectDb()

// console.log(process.env.MONGO_URI)
const importData = async () => {
    var movies;
    try {
        await Movie.deleteMany({});
        
        const movies = await fetchAndStoreMovies();
        
        await Movie.insertMany(movies);
        console.log('Data seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error while seeding:', error);
        process.exit(1);
    }
};

importData();