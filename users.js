// Mock user database
const users = [];

// Check if username exists
function isValid(username) {
  return users.some((u) => u.username === username);
}

// Authenticate user
function authenticatedUser(username, password) {
  return users.some((u) => u.username === username && u.password === password);
}

module.exports = { users, isValid, authenticatedUser };
