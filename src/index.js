const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const auth = require('./routes/auth');
const protected = require('./routes/protected');

// MongoDB connection
const uname = "deeterd1";
const psword = "Xb0x4ly3r";
const cluster = "messengerdb.sd589";
const dbname = "";  

const uri = `mongodb+srv://${uname}:${psword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const mongoose_settings = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, mongoose_settings);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Connected successfully to MongoDB");
});

// Middleware setup
app.use(cookieParser());

app.use(session({
    secret: "Buckeyes",
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().array());

// View engine setup
app.set('view engine', 'pug');
app.set('views', './views');

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

// Routes
app.use('/', auth);
app.use('/', protected);

// Server setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
