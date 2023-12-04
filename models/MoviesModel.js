const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  imageUrl: String,
  id: String,
  qid: String,
  overview: String,
  releaseDate: String,
  adult: Boolean,
  genreIds: [Number],
  videoUrl: String,
  seasons: [
    {
      seasonNumber: Number,
      name: String,
      episodes: [
        {
          name: String,
          episodeNumber: Number,
          overview: String,
          imageUrl: String,
          videoUrl: String,
        },
      ],
    },
  ],
  
}, {
    timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
