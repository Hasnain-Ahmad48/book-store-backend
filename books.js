const express = require("express");
const mongoose = require("mongoose");
const books = express.Router();

// --- 1. Define the Book Schema and Model ---
const ReviewSchema = new mongoose.Schema(
  {
    username: {type: String, required: true},
    review: {type: String, required: true},
    date: {type: Date, default: Date.now},
  },
  {_id: false}
); // We don't need a separate ID for reviews in the array

const BookSchema = new mongoose.Schema({
  isbn: {type: String, required: true, unique: true},
  title: {type: String, required: true},
  author: {type: String, required: true},
  reviews: [ReviewSchema], // Array of embedded review documents
});

const Book = mongoose.model("Book", BookSchema);

// --- 2. Updated Route Handlers to use Mongoose/MongoDB ---

// POST: Add a new book
books.post("/", async (req, res) => {
  // Added async
  const {isbn, title, author} = req.body;

  if (!isbn || !title || !author)
    return res
      .status(400)
      .json({message: "ISBN, title, and author are required"});

  try {
    // Check if book already exists
    if (await Book.findOne({isbn}))
      return res
        .status(400)
        .json({message: "Book with this ISBN already exists"});

    // Create and save the new book document
    const newBook = await Book.create({isbn, title, author, reviews: []});

    res.status(201).json({message: "Book added successfully", data: newBook});
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Database error during book creation",
        error: error.message,
      });
  }
});

// GET all books
books.get("/", async (req, res) => {
  // Added async
  const booksList = await Book.find({}); // Fetch all books
  res.json({message: "All books fetched", data: booksList});
});

// GET book by ISBN
books.get("/:isbn", async (req, res) => {
  // Added async
  const book = await Book.findOne({isbn: req.params.isbn});
  if (!book) return res.status(404).json({message: "Book not found"});
  res.json({message: "Book fetched successfully", data: book});
});

// GET books by Author
books.get("/author/:author", async (req, res) => {
  // Added async
  const author = req.params.author;
  // Use $regex for case-insensitive partial match, or just exact match
  const result = await Book.find({
    author: {$regex: new RegExp(`^${author}$`, "i")},
  });

  if (!result.length) return res.status(404).json({message: "No books found"});
  res.json({message: "Books by author fetched", data: result});
});

// GET books by Title
books.get("/title/:title", async (req, res) => {
  // Added async
  const title = req.params.title;
  const result = await Book.find({
    title: {$regex: new RegExp(`^${title}$`, "i")},
  });

  if (!result.length) return res.status(404).json({message: "No books found"});
  res.json({message: "Books by title fetched", data: result});
});

// GET all reviews for a book
books.get("/reviews/:isbn", async (req, res) => {
  // Added async
  const book = await Book.findOne({isbn: req.params.isbn});
  if (!book) return res.status(404).json({message: "Book not found"});
  res.json({message: "Reviews fetched", reviews: book.reviews});
});

// POST: Add a review (Authenticated user data is in req.user from JWT)
books.post("/auth/review/:isbn", async (req, res) => {
  // Added async
  const isbn = req.params.isbn;
  // Extract username from the authenticated user token
  const username = req.user.username;
  const {review} = req.body;

  if (!review) return res.status(400).json({message: "Review text required"});

  // Find the book
  const book = await Book.findOne({isbn});
  if (!book) return res.status(404).json({message: "Book not found"});

  // Remove old review if it exists (so the post behaves like a write/update)
  book.reviews = book.reviews.filter(r => r.username !== username);

  // Add new review
  book.reviews.push({username, review});
  await book.save();

  res.json({message: "Review added successfully", data: book});
});

// PUT: Update a review (per username)
books.put("/auth/review/:isbn", async (req, res) => {
  // Added async
  const isbn = req.params.isbn;
  const username = req.user.username; // Use username from JWT
  const {review} = req.body;

  if (!review) return res.status(400).json({message: "Review text required"});

  const book = await Book.findOne({isbn});
  if (!book) return res.status(404).json({message: "Book not found"});

  const reviewIndex = book.reviews.findIndex(r => r.username === username);

  if (reviewIndex === -1)
    return res
      .status(404)
      .json({message: "No review found for this user to update"});

  // Update the review text
  book.reviews[reviewIndex].review = review;
  await book.save();

  res.json({message: "Review updated successfully", data: book});
});

// DELETE: Remove a review (per username)
books.delete("/auth/review/:isbn", async (req, res) => {
  // Added async
  const isbn = req.params.isbn;
  // User is identified via JWT token, NOT URL parameter
  const username = req.user.username;

  const book = await Book.findOne({isbn});
  if (!book) return res.status(404).json({message: "Book not found"});

  const initialLength = book.reviews.length;

  // Filter out the review by the authenticated user
  book.reviews = book.reviews.filter(r => r.username !== username);

  if (book.reviews.length === initialLength)
    return res.status(404).json({message: "Review not found for this user"});

  await book.save();
  res.json({message: "Review deleted successfully", data: book});
});

module.exports = {books, Book}; // Export Book Model for index.js
