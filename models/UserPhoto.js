const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPhoto = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    pictures : {
        type : String
    },
    url: {
        type: String
    },
    date : {
        type : Date,
        default :Date.now
    }
});

module.exports = mongoose.model("UserPhoto", userPhoto, "usersphotos");