// //allow for index to access page
// const express = require('express');
// const router = express.Router();

// //pulling user info from DB
// const {User, findUserById, updateUser} = require('../models/user.js'); 

// //socket.io setup
// import {Server} from 'socket.io';
// const server = createServer(app);
// const io = new Server(server);

// //route to DM page
// router.get('/messages', (req, res) => {
//     res.render('messages', {title: 'Direct Messages'});
// });

// io.on("connection", async (socket) => {
//     console.log(`Socket connected: ${socket.id}`);

//     //authenticate user
//     const userID = socket.handshake.query.userID;
//     const user = await findUserById(userID);

//     if(!user) {
//         console.log("Invalid user ID, disconnecting socket.");
//         socket.disconnect();
//         return;
//     }

//     //update user's socketID in DB
//     await updateUser(userID, {socketID: socket.id});

//     //fetch undelivered messages
//     const undeliveredMessages = await Message.find({ recipientID: user.id, delivered: false });

//     //send each undelivered message to the user
//     undeliveredMessages.forEach(async (message) => {
//         socket.emit("private message", {
//             content: message.content,
//             from: message.senderID,
//         });

//         // Mark the message as delivered
//         message.delivered = true;
//         await message.save();
//     });

//     console.log("Delivered all undelivered messages.");

//     //fetch and send all connected users to newly connected user
//     const connectedUsers = await User.find({ socketID: { $ne: null } }).select("id name socketID");
//     socket.emit("users", connectedUsers);

//     //notify other users about new connection
//     socket.broadcast.emit("user connected", {
//         userID: user.id,
//         name: user.name,
//     });

//     socket.on("private message", async ({ content, to }) => {
//         const recipient = await User.findOne({ id: to });
    
//         if (recipient && recipient.socketID) {
//             //if recipient is online, send message directly
//             io.to(recipient.socketID).emit("private message", {
//                 content,
//                 from: {
//                     userID: user.id,
//                     name: user.name,
//                 },
//             });
//         } else {
//             //if recipient offline, save the message to the database
//             const message = new Message({
//                 senderID: user.id,
//                 recipientID: to,
//                 content,
//             });
//             await message.save();
//             console.log("Message saved for offline delivery.");
//         }
//     });

// })
// module.exports = router;