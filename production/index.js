const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const auth = require('./routes/auth');
const protected = require('./routes/protected');
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server); // Changed this line
const db = require('./config/db');

const socketHandler = require('./socket-server');

// Session middleware setup
const sessionMiddleware = session({
    secret: "Buckeyes",
    resave: true,
    saveUninitialized: true
});

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().array());

// Share session middleware with Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// View engine setup
app.set('view engine', 'pug'); 
app.set('views', path.join(__dirname, '../public/views'));
app.use('/css', express.static(path.join(__dirname, '../src/public/css')));
app.use('/js', express.static(path.join(__dirname, '../src/public/js')));

// Logging middleware for tracking current users

const userModel = require('./models/user');
app.use('/', async (req, res, next) => {
    try {
        const users = await userModel.getUsers();
        const cur_users = users.map(user => (user.id + "  ")).join('');
        console.log("Registered users: ", cur_users);
    
        if (req.session.user) {
            console.log(`Current user: ${req.session.user.id}`);
        } else {
            console.log("Current user: Not set");
        }
    } catch (error) {
        console.log("Error fetching users: ", error);
    }
    next(); // Ensure next middleware is called
});

// Routes for the site
app.use('/', auth);
app.use('/', protected);

// Attach socket.io logic
socketHandler(io);

// Server setup
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
