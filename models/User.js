const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        default: "manager"
    },
    password: {
        type: String,
        // regex: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        required: true
    },
    password2: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("User", userSchema, "usersMP");
