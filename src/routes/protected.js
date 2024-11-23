const express = require('express');
const router = express.Router();
const { updateUser, findUserById, getUsers } = require('../models/user.js'); 
const mongoose = require('mongoose');
const { Channel } = require('../models/channel');
const { Message } = require('../models/message');


// Middleware to check if the user is an admin
const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.Admin === true) {
        return next();
    } else {
        const err = new Error("You do not have permission to access this page.");
        err.status = 403; // Forbidden
        return next(err);
    }
};

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

// Add this route to your existing protected.js
router.get('/api/current-user', checkSignIn, (req, res) => {
    // Return safe user data
    res.json({
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email
    });
});

router.get('/api/channels/:channelId/messages', checkSignIn, async (req, res) => {
    try {
        let channel;
        if (req.params.channelId === 'global') {
            channel = await Channel.findOne({ type: 'global' })
                .populate({
                    path: 'messages',
                    populate: {
                        path: 'sender',
                        select: 'name id'
                    }
                });
        } else {
            channel = await Channel.findById(req.params.channelId)
                .populate({
                    path: 'messages',
                    populate: {
                        path: 'sender',
                        select: 'name id'
                    }
                });
        }

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json(channel.messages || []);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
//sending messages
router.post('/api/channels/:channelId/messages', checkSignIn, async (req, res) => {
    try {
        const channel = req.params.channelId === 'global' 
            ? await Channel.findOne({ type: 'global' })
            : await Channel.findById(req.params.channelId);

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        const message = new Message({
            content: req.body.content,
            sender: req.session.user._id,
            timestamp: new Date()
        });

        await message.save();
        channel.messages.push(message._id);
        await channel.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name id');

        res.json(populatedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

router.post('/api/channels', checkSignIn, async (req, res) => {
    try {
        const { type, name, participants } = req.body;
        let channel;

        switch (type) {
            case 'global':
                channel = await Channel.findOne({ type: 'global' });
                if (!channel) {
                    channel = await new Channel({
                        name: 'Global Chat',
                        type: 'global',
                        participants: [],
                        messages: []
                    }).save();
                }
                break;
                
            case 'direct':
                if (!participants || participants.length !== 2) {
                    return res.status(400).json({ error: 'Direct messages require exactly 2 participants' });
                }
                channel = await Channel.findOne({
                    type: 'direct',
                    participants: { 
                        $all: participants,
                        $size: 2
                    }
                });
                if (!channel) {
                    channel = await new Channel({
                        name: `DM: ${participants.join(' & ')}`,
                        type: 'direct',
                        participants,
                        messages: []
                    }).save();
                }
                break;

            case 'group':
                if (!name || !participants || participants.length < 2) {
                    return res.status(400).json({ error: 'Group channels require a name and at least 2 participants' });
                }
                channel = await new Channel({
                    name,
                    type: 'group',
                    participants,
                    messages: []
                }).save();
                break;

            default:
                return res.status(400).json({ error: 'Invalid channel type' });
        }

        res.json(channel);
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ error: 'Failed to create channel' });
    }
});

router.get('/api/users', checkSignIn, async (req, res) => {
    try {
        const users = await getUsers();
        const safeUserData = users
            .filter(user => !user.Disabled) // Exclude disabled users
            .map(user => ({
                id: user.id,
                name: user.name,
                online: true // You can implement real online status later
            }));
        res.json(safeUserData);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
//optional for getting status
router.get('/api/users/status', checkSignIn, async (req, res) => {
    try {
        const onlineUsers = new Set(); // Implement your online tracking logic
        res.json({ onlineUsers: Array.from(onlineUsers) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user status' });
    }
});

// Admin page route, only accessible by admin users
router.get('/admin', checkSignIn, checkAdmin, async (req, res) => {
    try {
        const users = await getUsers(); // Make sure getUsers() returns an array of user objects
        res.render('admin', { users: users, message: null });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.render('admin', { users: [], message: "Error loading users." });
    }
});


router.get('/chat', checkSignIn, (req, res) => {
    res.render('chat', { 
        user: req.session.user,
        currentPage: 'chat' });
});

//API route for chat


// Protected page route
router.get('/protected_page', checkSignIn, (req, res) => {
    if (req.session.user && req.session.user.Admin === true) {
        res.redirect('/admin');
    } else {
        res.render('protected_page', { id: req.session.user.id });
    }
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

router.post('/admin', checkSignIn, checkAdmin, async (req, res) => {
    console.log("Reached the /admin route");
    try {
        // Fetch all users from the database
        const users = await getUsers();

        // Render the admin page with the list of users
        res.render('admin', { users: users, message: '' });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.render('admin', { message: "Error fetching user list." });
    }
});

router.post('/admin/toggle', checkSignIn, checkAdmin, async (req, res) => {
    console.log("Reached the /admin/toggle route");
    try {
        const { userId } = req.body;
        console.log("User ID: ", userId);
        // Find the user by ID
        const user = await findUserById(userId);

        // Check if the user exists
        if (!user) {
            return res.render('admin', { message: "User not found." });
        }

        console.log("User found:", user);

        // Toggle the Disabled status
        user.Disabled = !user.Disabled;

        console.log("After toggling:", user);

        // Save the updated user
        await user.save();

        // Fetch the updated users list
        const users = await getUsers();

        // Render the admin page with the updated list of users
        res.render('admin', { users: users, message: 'User status updated successfully!' });
    } catch (err) {
        console.error("Error while updating user status:", err);
        res.render('admin', { message: "Error updating user status." });
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

// Error handling middleware for admin page
router.use('/admin', (err, req, res, next) => {
    if (err.status === 403) {
        res.render('login', { message: "You cannot view this page unless you are an admin!!!!"});
    } else {
        next(err);
    }
});

module.exports = router;
