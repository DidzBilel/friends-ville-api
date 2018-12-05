const mongoose = require("mongoose");
var ObjectID = mongoose.ObjectID;

var PublicationSchema = new mongoose.Schema({
  author: { id: String, login: String },
  like: Number,
  likers: Array,
  isViewable: Boolean,
  content: String,
  viewers: Array,
  publishDate: String,
  comments: Array
});

var Publication = mongoose.model("Publication", PublicationSchema);
module.exports = Publication;
