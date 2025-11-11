const express = require("express");
const books = express.Router();

// Mock books database
let booksDB = {
  12345: {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    reviews: {}, // { username: "review text" }
  },
  67890: {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    reviews: {},
  },
};

// ----------------------------
// POST: Add a new book
// ----------------------------
books.post("/", (req, res) => {
  const {isbn, title, author} = req.body;

  if (!isbn || !title || !author)
    return res
      .status(400)
      .json({message: "ISBN, title, and author are required"});

  if (booksDB[isbn])
    return res
      .status(400)
      .json({message: "Book with this ISBN already exists"});

  booksDB[isbn] = {
    title,
    author,
    reviews: {},
  };

  res
    .status(201)
    .json({message: "Book added successfully", data: booksDB[isbn]});
});

// ----------------------------
// GET all books
// ----------------------------
books.get("/", (req, res) => {
  res.json({message: "All books fetched", data: booksDB});
});

// ----------------------------
// GET book by ISBN
// ----------------------------
books.get("/:isbn", (req, res) => {
  const book = booksDB[req.params.isbn];
  if (!book) return res.status(404).json({message: "Book not found"});
  res.json({message: "Book fetched successfully", data: book});
});

// ----------------------------
// GET books by Author
// ----------------------------
books.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.values(booksDB).filter(
    b => b.author.toLowerCase() === author
  );
  if (!result.length) return res.status(404).json({message: "No books found"});
  res.json({message: "Books by author fetched", data: result});
});

// ----------------------------
// GET books by Title
// ----------------------------
books.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.values(booksDB).filter(
    b => b.title.toLowerCase() === title
  );
  if (!result.length) return res.status(404).json({message: "No books found"});
  res.json({message: "Books by title fetched", data: result});
});

// ----------------------------
// GET all reviews for a book
// ----------------------------
books.get("/reviews/:isbn", (req, res) => {
  const book = booksDB[req.params.isbn];
  if (!book) return res.status(404).json({message: "Book not found"});
  res.json({message: "Reviews fetched", reviews: book.reviews});
});

// ----------------------------
// POST: Add a review (requires username in body)
// ----------------------------
books.post("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const {username, review} = req.body;

  if (!booksDB[isbn]) return res.status(404).json({message: "Book not found"});
  if (!username || !review)
    return res.status(400).json({message: "Username and review required"});

  booksDB[isbn].reviews[username] = review;
  res.json({message: "Review added successfully", data: booksDB[isbn]});
});

// ----------------------------
// PUT: Update a review (per username)
// ----------------------------
books.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const {username, review} = req.body;

  if (!booksDB[isbn]) return res.status(404).json({message: "Book not found"});
  if (!username || !review)
    return res.status(400).json({message: "Username and review required"});

  if (!booksDB[isbn].reviews[username])
    return res.status(404).json({message: "No review found for this user"});

  booksDB[isbn].reviews[username] = review;
  res.json({message: "Review updated successfully", data: booksDB[isbn]});
});

// ----------------------------
// DELETE: Remove a review (per username)
// ----------------------------
books.delete("/auth/review/:isbn/:username", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.params.username;

  if (!booksDB[isbn]) return res.status(404).json({message: "Book not found"});
  if (!booksDB[isbn].reviews[username])
    return res.status(404).json({message: "Review not found for this user"});

  delete booksDB[isbn].reviews[username];
  res.json({message: "Review deleted successfully", data: booksDB[isbn]});
});

module.exports = books;
