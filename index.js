// index.js

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
// Import the router and the Book Model
const {books, Book} = require("./books.js");
// Import the new Mongoose-backed functions
const {userExists, authenticatedUser} = require("./users.js");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "mysecretkey";
const DB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// -------------------
// User registration
// -------------------
app.post("/register", async (req, res) => {
  // Added async
  const {username, password} = req.body;
  if (!username || !password)
    return res.status(400).json({message: "Username and password required"});

  // Use the MongoDB-backed check
  if (await userExists(username))
    return res.status(400).json({message: "User already exists"});

  try {
    // User.create is implicitly done via the Model import in users.js
    // If you want to create it here, you'd need to import 'User' model
    // For simplicity, let's keep the logic in users.js for now,
    // but if 'User' is not exported from users.js, you MUST update this:

    // **Assuming you import and use the 'User' model here for clarity:**
    const {User} = require("./users.js"); // Assuming 'User' is exported from users.js
    const newUser = new User({username, password});
    await newUser.save();

    res.json({message: "User registered successfully", user_id: newUser._id});
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({message: "Error registering user."});
  }
});

// -------------------
// User login
// -------------------
app.post("/login", async (req, res) => {
  // Added async
  const {username, password} = req.body;

  // Use the MongoDB-backed authentication
  const user = await authenticatedUser(username, password);

  if (!user)
    return res.status(401).json({message: "Invalid username or password"});

  // Include ID in token for better review handling
  const token = jwt.sign({username: user.username, id: user._id}, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({message: "Login successful", token});
});

// -------------------
// JWT middleware (No change needed here)
// -------------------
function authenticateJWT(req, res, next) {
  // ... (existing JWT logic remains the same)
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
// NOTE: Since you defined routes in books.js, this is where you'll protect them:
// app.use("/books/auth", authenticateJWT); // This is correct if used before the router is mounted

// -------------------
// Routes
// -------------------
app.use("/books", books); // Use the books router

// -------------------
// Connect to MongoDB and then Start server
// -------------------
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ Connected successfully to MongoDB!");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
