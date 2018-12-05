/**
 * THIS FILE CONTAINS ALL THE TREATMENTS ABOUT THE RESULTS FROM THE DATABASE.
 * AND IS THEN EXPORTED AS A MODULE TO REUSE THE METHODS IN THE SERVER.
 */
const db = require("../db"),
  User = require("../models/user");

const createNewUser = function(user) {
  var newUser = new User({
    ...user,
    isOnline: true,
    isAdmin: false,
    friends: {}
  });

  return db.saveNewUser(newUser);
};

const getUserById = function(id) {
  return db.fetchUserById(id);
};
const getUserByLogin = function(login) {
  return db.fetchUserByLogin(login);
};

const getUsersByTerms = function(terms) {
  return db.fetchUsersByTerms(terms);
};

const updateUser = function(user) {
  var userToSave = user;
  return db.updateUser(userToSave);
};

const deleteUser = function(id) {
  return db.deleteUser(id);
};

module.exports = {
  createNewUser,
  getUserById,
  getUserByLogin,
  getUsersByTerms,
  updateUser,
  deleteUser
};
