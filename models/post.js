const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title : {
        type : String,
    },
    dec : {
        type : String,
    },
    img : {
        type : String
    }

})

module.exports = new mongoose.model("post",postSchema)