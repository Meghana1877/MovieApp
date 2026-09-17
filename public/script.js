async function addMovie() {
    const formData = new FormData();
    console.log("Movie ID:", document.getElementById("movieId").value);
console.log("Title:", document.getElementById("title").value);
console.log("Genre:", document.getElementById("genre").value);
console.log("Year:", document.getElementById("year").value);
console.log("Director:", document.getElementById("director").value);

formData.append("movieId", document.getElementById("movieId").value);
formData.append("title", document.getElementById("title").value);
formData.append("genre", document.getElementById("genre").value);
formData.append("year", document.getElementById("year").value);
formData.append("director", document.getElementById("director").value);

const poster = document.getElementById("poster").files[0];

if (poster) {
    formData.append("poster", poster);
}
    try {
        const response = await fetch("/movies", {
    method: "POST",
    body: formData
});
        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Movie added successfully!");

        clearForm();
        getMovies();

    } catch (error) {
        alert("Error adding movie");
        console.error(error);
    }
}


// GET ALL MOVIES
async function getMovies() {
    try {
        const response = await fetch("/movies");
        const movies = await response.json();

        const movieList = document.getElementById("movieList");

        movieList.innerHTML = "";

        if (movies.length === 0) {
            movieList.innerHTML = "<p>No movies available.</p>";
            return;
        }

        for (const movie of movies) {

            const reviewResponse = await fetch(
                `/movies/${movie.movieId}/reviews`
            );

            const reviews = await reviewResponse.json();

            let averageRating = 0;

            if (reviews.length > 0) {
                const totalRating = reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                );

                averageRating = (
                    totalRating / reviews.length
                ).toFixed(1);
            }

            movieList.innerHTML += `
                <div class="movie-card">

                    ${
                        movie.poster
                            ? `<img src="/uploads/${movie.poster}" class="movie-poster">`
                            : ""
                    }

                    <h3>${movie.title}</h3>

                    <p><b>Movie ID:</b> ${movie.movieId}</p>
                    <p><b>Genre:</b> ${movie.genre}</p>
                    <p><b>Year:</b> ${movie.year}</p>
                    <p><b>Director:</b> ${movie.director}</p>

                    <p class="rating">
                        ⭐ ${averageRating}/5
                    </p>

                    <p class="review-count">
                        💬 ${reviews.length} Review${reviews.length !== 1 ? "s" : ""}
                    </p>

                    <button onclick="editMovie('${movie.movieId}')">
                        Edit
                    </button>

                    <button onclick="deleteMovie('${movie.movieId}')">
                        Delete
                    </button>
                    <button onclick="addReview('${movie.movieId}')">
    ⭐ Add Review
</button>

<button onclick="viewReviews('${movie.movieId}')">
    💬 View Reviews
</button>

                </div>
            `;
        }

    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// UPDATE MOVIE
async function updateMovie(movieId) {

    const movie = {
        title: document.getElementById("title").value,
        genre: document.getElementById("genre").value,
        year: Number(document.getElementById("year").value),
        director: document.getElementById("director").value
    };

    try {

        const response = await fetch(`/movies/${movieId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(movie)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Movie updated successfully!");

        clearForm();
        getMovies();

    } catch (error) {
        alert("Error updating movie");
        console.error(error);
    }
}


// DELETE MOVIE
async function deleteMovie(movieId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this movie?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`/movies/${movieId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Movie deleted successfully!");

        getMovies();

    } catch (error) {
        alert("Error deleting movie");
        console.error(error);
    }
}


// CLEAR FORM
function clearForm() {

    document.getElementById("movieId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("year").value = "";
    document.getElementById("director").value = "";

    const button = document.querySelector(".form-container button");

    button.textContent = "Add Movie";

    button.onclick = addMovie;
}


// LOAD MOVIES WHEN PAGE OPENS
async function searchMovies() {
    const search = document.getElementById("searchInput").value.trim();

    if (search === "") {
        getMovies();
        return;
    }

    try {
        const response = await fetch(`/search?q=${encodeURIComponent(search)}`);
        const movies = await response.json();

        const movieList = document.getElementById("movieList");

        movieList.innerHTML = "";

        if (movies.length === 0) {
            movieList.innerHTML = "<p>No movies found.</p>";
            return;
        }

        movies.forEach(movie => {
            movieList.innerHTML += `
                <div class="movie-card">

                    ${movie.poster ? `<img src="/uploads/${movie.poster}" class="movie-poster">` : ""}

                    <h3>${movie.title}</h3>

                    <p><b>Movie ID:</b> ${movie.movieId}</p>
                    <p><b>Genre:</b> ${movie.genre}</p>
                    <p><b>Year:</b> ${movie.year}</p>
                    <p><b>Director:</b> ${movie.director}</p>

                    <button onclick="editMovie('${movie.movieId}')">
                        Edit
                    </button>

                    <button onclick="deleteMovie('${movie.movieId}')">
                        Delete
                    </button>

                </div>
            `;
        });

    } catch (error) {
        console.error("Error searching movies:", error);
    }
}
let selectedMovieId = "";

function addReview(movieId) {
    selectedMovieId = movieId;

    // Close reviews modal if it is open
    document.getElementById("reviewModal").style.display = "none";

    // Clear old values
    document.getElementById("reviewer").value = "";
    document.getElementById("reviewRating").value = "";
    document.getElementById("reviewComment").value = "";

    // Open Add Review modal
    document.getElementById("addReviewModal").style.display = "flex";
}
async function submitReview() {
    const reviewer = document.getElementById("reviewer").value.trim();
    const rating = Number(
        document.getElementById("reviewRating").value
    );
    const comment = document.getElementById("reviewComment").value.trim();

    if (!reviewer || !rating || !comment) {
        alert("Please fill in all review fields.");
        return;
    }

    if (rating < 1 || rating > 5) {
        alert("Rating must be between 1 and 5.");
        return;
    }

    try {
        const response = await fetch(
            `/movies/${selectedMovieId}/reviews`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reviewer: reviewer,
                    rating: rating,
                    comment: comment
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Review added successfully!");

        closeAddReview();
        getMovies();

    } catch (error) {
        console.error("Error adding review:", error);
        alert("Error adding review");
    }
}
function closeAddReview() {
    document.getElementById("addReviewModal").style.display = "none";
}
async function viewReviews(movieId) {
    try {
        const response = await fetch(`/movies/${movieId}/reviews`);
        const reviews = await response.json();

        if (!response.ok) {
            alert(reviews.message);
            return;
        }

        const reviewList = document.getElementById("reviewList");

        reviewList.innerHTML = "";

        if (reviews.length === 0) {
            reviewList.innerHTML = `
                <p class="no-reviews">
                    No reviews available for this movie.
                </p>
            `;
        } else {
            reviews.forEach(review => {
                reviewList.innerHTML += `
                    <div class="review-item">

                        <h3>👤 ${review.reviewer}</h3>

                        <div class="review-rating">
                            ${"⭐".repeat(review.rating)}
                            <span>${review.rating}/5</span>
                        </div>

                        <p class="review-comment">
                            "${review.comment}"
                        </p>

                    </div>
                `;
            });
        }

        document.getElementById("addReviewModal").style.display = "none";
document.getElementById("reviewModal").style.display = "flex";

    } catch (error) {
        console.error("Error fetching reviews:", error);
        alert("Error loading reviews");
    }
}
function closeReviews() {
    document.getElementById("reviewModal").style.display = "none";
}
getMovies();