const mongoose = require('mongoose');
//Bycrypt
const bcrypt = require('bcrypt');
const saltRounds = 10; 


const userSchema = mongoose.Schema({
    id: String,
    password: String
});

//hashing password pre save
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    try{
        user.password = await bcrypt.hash(user.password, saltRounds);
        next();
    }
    catch(err){
        next(err);
    }
});

//Compare password 
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
async function addUser(id, password) {
    const newUser = new User({ id, password });
    return await newUser.save();
}

// Get all users
async function getUsers() {
    return await User.find();
}

module.exports = { User, findUser, findUserById, addUser, getUsers };
