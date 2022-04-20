const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get("mongoURI");
module.exports = mongoose.connect(
    mongoURI,
    {
        useNewUrlParser: true,
        useFindAndModify:false,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    err => {
        if (err) throw err;
        console.log("DB connected!");
    }
);