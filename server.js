const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const Movie = require("./models/Movie");
const Review = require("./models/Review");

const app = express();

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post("/movies", upload.single("poster"), async (req, res) => {
    console.log("🔥 POST /movies ROUTE REACHED");
    try {
        console.log("Received body:", req.body);
        console.log("Received file:", req.file);

        const movie = new Movie({
            movieId: req.body.movieId,
            title: req.body.title,
            genre: req.body.genre,
            year: Number(req.body.year),
            director: req.body.director,
            poster: req.file ? req.file.filename : ""
        });

        const savedMovie = await movie.save();

        res.status(201).json(savedMovie);

    } catch (error) {
        console.error("ADD MOVIE ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

app.get("/movies", async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/movies/:movieId", async (req, res) => {
    try {
        const movie = await Movie.findOne({
            movieId: req.params.movieId
        });

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/search", async (req, res) => {
    try {
        const search = req.query.q;

        const movies = await Movie.find({
            title: {
                $regex: search,
                $options: "i"
            }
        });

        res.status(200).json(movies);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
app.put("/movies/:movieId", async (req, res) => {
    try {
        const movie = await Movie.findOneAndUpdate(
            { movieId: req.params.movieId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.delete("/movies/:movieId", async (req, res) => {
    try {
        const movie = await Movie.findOneAndDelete({
            movieId: req.params.movieId
        });

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json({
            message: "Movie deleted successfully",
            movie: movie
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/movies/:movieId/reviews", async (req, res) => {
    try {
        const review = new Review({
            movieId: req.params.movieId,
            reviewer: req.body.reviewer,
            rating: Number(req.body.rating),
            comment: req.body.comment
        });

        const savedReview = await review.save();

        res.status(201).json(savedReview);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
app.get("/movies/:movieId/reviews", async (req, res) => {
    try {
        const reviews = await Review.find({
            movieId: req.params.movieId
        });

        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });