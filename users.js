const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- 1. Define the User Schema and Model ---
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Middleware to hash the password before saving a new user
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Custom method to compare plain-text password with the stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// --- 2. Update Helper Functions to use MongoDB ---
const userExists = async (username) => {
    return User.findOne({ username }); // Find user for registration check
};

const authenticatedUser = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        return false; // User not found
    }
    const isMatch = await user.comparePassword(password);
    return isMatch ? user : false; // Return the user document or false
};

module.exports = {
    User,
    userExists,
    authenticatedUser,
    // Note: The 'users' array and 'isValid' function are no longer needed
};