const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author : {
        type: String,
        required: true
    },
    date : {
        type: String,
        required: true
    },
    comment : {
        type: String,
        required: true
    },
    blogpost : {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true    
    },
    blogpost_title : {
        type: String,
        required: true
    },
    approved : {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model("Comment", commentSchema);