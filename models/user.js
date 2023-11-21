const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: false 
    }],
    bio: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: true    
    },
    lastName: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("User", userSchema);