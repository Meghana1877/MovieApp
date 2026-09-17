const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true
    },

    reviewer: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Review", reviewSchema);