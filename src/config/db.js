// MongoDB connection
const uname = "deeterd1";
const psword = "Xb0x4ly3r";
const cluster = "messengerdb.sd589";
const dbname = "";  

const uri = `mongodb+srv://${uname}:${psword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const mongoose = require('mongoose'); 
const mongoose_settings = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, mongoose_settings);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Connected successfully to MongoDB");
});


module.exports = {db}