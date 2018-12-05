const mongoose = require("mongoose");
const user = require("./user");
const privateMessage = require("./privateMessage");

var DiscussionSchema = new mongoose.Schema({
  idFirstUser: Object,
  idSecondUser: Object,
  privateMessage: Array
});

var Discussion = mongoose.model("Discussion", DiscussionSchema);
module.exports = Discussion;
