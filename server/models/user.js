const mongoose = require("mongoose");
const ObjectID = mongoose.ObjectID;

var UserSchema = new mongoose.Schema({
  login: String,
  password: String,
  name: String,
  lastName: String,
  mail: String,
  gender: String,
  age: Number,
  description: String,
  isOnline: Boolean,
  isAdmin: Boolean,
  friends: Array,
  likedPublications: Array
});

var User = mongoose.model("User", UserSchema);
module.exports = User;
