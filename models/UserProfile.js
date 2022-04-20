const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProfile = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    bio : {
        type : String,
        required : true
    },
    location : {
        type : String,
    },
    skills : {
        type : [String],
        required : true
    },
    employees : {
        type : [String]
    },
    ongoingProject: [
        {
            title : {
                type : String,
                required : true
            },
            address: {
              type : String,
                required : true  
            },
             objectives: {
              type : String,
                required : true  
            },
             summary: {
              type : String,
              required : true  
            },
            cstatus:{
                type: String,
                default: "Ongoing"
            },
            money:{
                type: Number,
                default: 10000
            }
        }
    ],
    experience : [
        {
            title : {
                type : String,
                required : true
            },
            company : {
                type : String,
                required : true
            },
            desc : {
                type : String,
                required: true
            }
        }
    ],
    date : {
        type : Date,
        default :Date.now
    }
});

module.exports = mongoose.model("UserProfile", userProfile, "usersprofile");