const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true,
        unique: true
    },

    title: {
        type: String,
        required: true
    },

    genre: {
        type: String,
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    director: {
        type: String,
        required: true
    },

    poster: {
    type: String
}
});

module.exports = mongoose.model("Movie", movieSchema);