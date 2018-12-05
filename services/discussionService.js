const db = require("../db"),
  Discussion = require("../models/discussion");

const createNewDiscussion = function(discussion) {
  var newDiscussion = new Discussion({
    ...discussion
  });
};

module.exports = { createNewDiscussion };
