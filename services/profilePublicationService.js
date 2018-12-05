/**
 * THIS FILE CONTAINS ALL THE TREATMENTS ABOUT THE RESULTS FROM THE DATABASE.
 * AND IS THEN EXPORTED AS A MODULE TO REUSE THE METHODS IN THE SERVER.
 */
const db = require("../db"),
  ProfilePublication = require("../models/profilePublication");

const createNewProfilePublication = function(profilePublication) {
  var newProfilePublication = new ProfilePublication({
    ...profilePublication
  });

  return db.saveNewProfilePublication(newProfilePublication);
};

const getProfilePublicationsByUser = function(userId) {
  return db.fetchAllPublicationsForProfile(userId);
};

const getProfilePublicationById = function(id) {
  return db.fetchProfilePublicationById(id);
};

const updateProfilePublication = function(profilePublication) {
  var profilePublicationToSave = profilePublication;
  return db.updatePublication(profilePublicationToSave);
};

const deleteProfilePublication = function(id) {
  return db.deleteProfilePublication(id);
};

module.exports = {
    createNewProfilePublication,
    getProfilePublicationsByUser,
    getProfilePublicationById,
    updateProfilePublication,
    deleteProfilePublication
};
