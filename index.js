require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose"); // New: MongoDB driver
const booksRoutes = require("./books.js");
const {users, isValid, authenticatedUser} = require("./users.js");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "mysecretkey";
const DB_URI = process.env.MONGODB_URI; // Get URI from .env

// -------------------
// User registration
// -------------------
app.post("/register", (req, res) => {
  const {username, password} = req.body;
  if (!username || !password)
    return res.status(400).json({message: "Username and password required"});
  if (isValid(username))
    return res.status(400).json({message: "User already exists"});

  users.push({username, password});
  res.json({message: "User registered successfully"});
});

// -------------------
// User login
// -------------------
app.post("/login", (req, res) => {
  const {username, password} = req.body;
  if (!authenticatedUser(username, password))
    return res.status(401).json({message: "Invalid username or password"});

  const token = jwt.sign({username}, SECRET_KEY, {expiresIn: "1h"});
  res.json({message: "Login successful", token});
});

// -------------------
// JWT middleware
// -------------------
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({message: "Token missing"});

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({message: "Invalid token"});
    req.user = user;
    next();
  });
}

// Protect review routes
app.use("/books/auth", authenticateJWT);

// -------------------
// Routes
// -------------------
app.use("/books", booksRoutes);

// -------------------
// Start server
// -------------------
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
