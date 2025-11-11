const axios = require("axios");

// 1️⃣ Get all books
function getAllBooks() {
  axios.get("http://localhost:3000/books")
    .then(res => console.log("All Books:", res.data))
    .catch(err => console.error(err.message));
}

// 2️⃣ Get book by ISBN
function getBookByISBN(isbn) {
  axios.get(`http://localhost:3000/books/${isbn}`)
    .then(res => console.log(`Book by ISBN ${isbn}:`, res.data))
    .catch(err => console.error(err.message));
}

// 3️⃣ Get books by Author
function getBooksByAuthor(author) {
  axios.get(`http://localhost:3000/books/author/${author}`)
    .then(res => console.log(`Books by Author "${author}":`, res.data))
    .catch(err => console.error(err.message));
}

// 4️⃣ Get books by Title
function getBooksByTitle(title) {
  axios.get(`http://localhost:3000/books/title/${title}`)
    .then(res => console.log(`Books with Title "${title}":`, res.data))
    .catch(err => console.error(err.message));
}

// 5️⃣ Get all reviews for a book
function getReviews(isbn) {
  axios.get(`http://localhost:3000/books/reviews/${isbn}`)
    .then(res => console.log(`Reviews for ISBN "${isbn}":`, res.data))
    .catch(err => console.error(err.message));
}

// 6️⃣ Add review
function addReview(isbn, username, review) {
  axios.post(`http://localhost:3000/books/auth/review/${isbn}`, { username, review })
    .then(res => console.log(res.data))
    .catch(err => console.error(err.message));
}

// 7️⃣ Update review
function updateReview(isbn, username, review) {
  axios.put(`http://localhost:3000/books/auth/review/${isbn}`, { username, review })
    .then(res => console.log(res.data))
    .catch(err => console.error(err.message));
}

// 8️⃣ Delete review
function deleteReview(isbn, username) {
  axios.delete(`http://localhost:3000/books/auth/review/${isbn}/${username}`)
    .then(res => console.log(res.data))
    .catch(err => console.error(err.message));
}

// ----------------------------
// Example calls
// ----------------------------
getAllBooks();
getBookByISBN("12345");
getBooksByAuthor("Harper Lee");
getBooksByTitle("The Great Gatsby");
getReviews("12345");

// Example: add/update/delete review
// addReview("12345", "user1", "Amazing book!");
// updateReview("12345", "user1", "Updated review text!");
// deleteReview("12345", "user1");
