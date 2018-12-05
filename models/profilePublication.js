const mongoose = require("mongoose");
var ObjectID = mongoose.ObjectID;

var ProfilePublicationSchema = new mongoose.Schema({
  author: { id: String, login: String },
  reciever: { id: String, login: String},
  like: Number,
  likers: Array,
  isViewable: Boolean,
  content: String,
  viewers: Array,
  publishDate: String,
  comments: Array
});

var ProfilePublication = mongoose.model("ProfilePublication", ProfilePublicationSchema);
module.exports = ProfilePublication;