const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: String,
    password: String
});

const User = mongoose.model("user", userSchema);

// Find user by credentials
async function findUser(id, password) {
    return await User.findOne({ id, password });
}

// Find user by ID
async function findUserById(id) {
    return await User.findOne({ id });
}

// Add a new user
async function addUser(id, password) {
    const newUser = new User({ id, password });
    return await newUser.save();
}

// Get all users
async function getUsers() {
    return await User.find();
}

module.exports = { User, findUser, findUserById, addUser, getUsers };
