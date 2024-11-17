const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

// Login page
router.get('/', (req, res) => {
    res.render('login');
});
router.get('/login', (req, res) => {
    res.render('login');
});

// Login handler
router.post('/login', async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
        return res.render('login', { message: "Please enter both id and password" });
    }

    try {
        const user = await userModel.findUserById(id);
        console.log(user);
        if (!user) {
            return res.render('login', { message: "Invalid credentials!!" });
        }

        // Compare hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { message: "Invalid credentials!" });
        }
        
        // If user is disabled, prevent login
        const isDisabled = user.Disabled;
        if(isDisabled){
            return res.render('login', {message: "Login Disabled!"});
        };
        

        req.session.user = user;
        res.redirect('/chat');
    } catch (err) {
        console.error("Login error: ", err);
        res.render('login', { message: "An error occurred, please try again." });
    }
});

// Signup page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup handler
router.post('/signup', async (req, res) => {
    const { id, password, name, email, UDid } = req.body;
    if (!id || !password) {
        return res.render('signup', { message: "Please enter both id and password" });
    }

    try {
        const existingUser = await userModel.findUserById(id);
        if (existingUser) {
            return res.render('signup', { message: "User Already Exists! Login or choose another user id" });
        }
        
        const newUser = await userModel.addUser(id, password, name, email, UDid);
        req.session.user = newUser;
        res.redirect('/protected_page');
    } catch (err) {
        console.error("Signup error: ", err);
        res.render('signup', { message: "An error occurred, please try again." });
    }
});

// Logout handler
router.get('/logout', (req, res) => {
    const userId = req.session.user?.id;
    req.session.destroy(() => {
        console.log(`${userId} logged out.`);
    });
    res.redirect('/login');
});

// Account Deletion handler
router.get('/deleteaccount', (req, res) => {
    const userId = req.session.user?.id;
    userModel.deleteUser(userId);
    
    req.session.destroy(() => {
        console.log(`${userId} deleted.`);
    });
    res.redirect('/signup');
});

module.exports = router;
