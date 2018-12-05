const mongoose = require("mongoose");
const user = require("./user");

var RelationsSchema = new mongoose.Schema({
  sender: Object,
  reciever: Object,
  status: String
});

var Relations = mongoose.model("Relations", RelationsSchema);
module.exports = Relations;
