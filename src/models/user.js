const mongoose = require('mongoose');
//Bycrypt
const bcrypt = require('bcrypt');
const saltRounds = 10; 


const userSchema = mongoose.Schema({
    id: String,
    password: String,
    userInfo: {
        name: String,
        email: String,
        UDid: String,
    }
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
    const newUser = new User({ 
        id, 
        password,
        userInfo: {
            name: userInfo.name || "",
            email: userInfo.email || "",
            UDid: userInfo.UDid || "",
        }
    });
    return await newUser.save();
}



// Get all users
async function getUsers() {
    return await User.find();
}

// Delete user
async function deleteUser(deletedUser) {
    User.deleteOne({ id: deletedUser.id })
    .then(result => console.log("Document deleted:", result))
    .catch(error => console.error("Error deleting document:", error));
}

module.exports = { User, findUser, findUserById, addUser, getUsers, deleteUser };
