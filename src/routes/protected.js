const express = require('express');
const router = express.Router();
const { updateUser, findUserById } = require('../models/user.js'); 

// Middleware to check if the user is signed in
const checkSignIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        const err = new Error("Not logged in!");
        err.status = 400;
        return next(err);
    }
};


router.get('/chat', checkSignIn, (req, res) => {
    res.render('chat', { 
        user: req.session.user,
        currentPage: 'chat' });
});

//API route for chat


// Protected page route
router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', { id: req.session.user.id });
});

// Edit page route
router.get('/edit_profile', checkSignIn, (req, res) => {
    res.render('edit_profile', {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email,
        UDid: req.session.user.UDid
    });
    console.log(req.session.user);
});

// Update profile route (POST)
router.post('/edit_profile', checkSignIn, async (req, res) => {
    const { id, name, email, UDid } = req.body;
    const currentUserId = req.session.user.id;

    try {
        // Check if the new ID is unique (if it's different from the current ID)
        if (id !== currentUserId) {
            const existingUser = await findUserById(id);
            if (existingUser) {
                // Reload the edit profile page with an error message if ID is already taken
                return res.render('edit_profile', {
                    alert: {
                        type: 'danger',
                        message: 'ID already taken. Please choose a different ID.'
                    },
                    id: currentUserId,             // Maintain current session values
                    name: req.session.user.name,
                    email: req.session.user.email,
                    UDid: req.session.user.UDid
                });
            }
        }

        // Update the user in the database
        const updatedUser = await updateUser(currentUserId, { id, name, email, UDid });

        // Update the session with new values
        req.session.user.id = updatedUser.id;
        req.session.user.name = updatedUser.name;
        req.session.user.email = updatedUser.email;
        req.session.user.UDid = updatedUser.UDid;

        // Redirect to the protected page or another relevant page after updating
        res.redirect('/protected_page');
    } catch (error) {
        console.error("Error updating user:", error);
        res.render('edit_profile', { message: "Error updating profile. Please try again." });
    }
});


// Error handling middleware for protected page
router.use('/protected_page', (err, req, res, next) => {
    res.render('protected_page', { message: "You cannot view this page unless you are logged in." });
});

// Error handling middleware for edit profile page
router.use('/edit_profile', (err, req, res, next) => {
    res.render('edit_profile', { message: "You cannot view this page unless you are logged in." });
});

module.exports = router;
