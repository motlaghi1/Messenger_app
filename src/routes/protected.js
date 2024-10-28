const express = require('express');
const router = express.Router();

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

// Protected page route
router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', { id: req.session.user.id });
});

// Edit page route
router.get('/edit_profile', checkSignIn, (req, res) => {
    res.render('edit_profile', { id: req.session.user.id, name: req.session.user.name, email: req.session.user.email, UDid: req.session.user.UDid });
    console.log(req.session.user)
});

// Error handling middleware for protected page
router.use('/protected_page', (err, req, res, next) => {
    res.render('protected_page', {message: "You cannot view this page unless you are logged in."})
});

// Error handling middleware for edit profile page
router.use('/edit_profile', (err, req, res, next) => {
    res.render('edit_profile', {message: "You cannot view this page unless you are logged in."})
});

module.exports = router;
