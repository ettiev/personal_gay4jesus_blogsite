const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    love: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    published: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model("Blog", blogSchema);