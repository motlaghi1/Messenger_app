const mongoose = require('mongoose');
// Bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = mongoose.Schema({
    id: { type: String, unique: true }, // Ensure IDs are unique at the schema level
    password: String,
    name: String,
    email: String,
    UDid: String,
    Admin: {type: Boolean, default: false},
    Disabled: {type: Boolean, default: false}
});

// Hashing password pre-save
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    try {
        user.password = await bcrypt.hash(user.password, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

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
async function addUser(id, password, name, email, UDid) {
    const newUser = new User({
        id,
        password,
        name,
        email,
        UDid
    });
    return await newUser.save();
}

// Update user information
async function updateUser(currentId, updates) {
    // Only update if the user is found by the current ID
    return await User.findOneAndUpdate(
        { id: currentId },
        { $set: updates },
        { new: true } // Return the updated document
    );
}

// Get all users
async function getUsers() {
    return await User.find();
}

// Delete user
async function deleteUser(deletedUserId) {
    return await User.deleteOne({ id: deletedUserId });
}

module.exports = { User, findUser, findUserById, addUser, updateUser, getUsers, deleteUser };
