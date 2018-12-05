const mongoose = require("mongoose");
var ObjectID = mongoose.ObjectID;

var PrivateMessageSchema = mongoose.Schema({
  author: { id: Object, login: String },
  content: String,
  receiver: { id: Object, login: String },
  date: Date
});

var PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);
module.exports = PrivateMessage;
