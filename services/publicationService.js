/**
 * THIS FILE CONTAINS ALL THE TREATMENTS ABOUT THE RESULTS FROM THE DATABASE.
 * AND IS THEN EXPORTED AS A MODULE TO REUSE THE METHODS IN THE SERVER.
 */
const db = require("../db"),
  Publication = require("../models/publication");

const createNewPublication = function(publication) {
  var newPublication = new Publication({
    ...publication
  });

  return db.saveNewPublication(newPublication);
};

const getPublicationsByUser = function(userId) {
  return db.fetchPublicationsByUser(userId);
};

const getPublicationById = function(id) {
  return db.fetchPublicationById(id);
};

const updatePublication = function(publication) {
  var publicationToSave = publication;
  return db.updatePublication(publicationToSave);
};

const deletePublication = function(id) {
  return db.deletePublication(id);
};

module.exports = {
  createNewPublication,
  getPublicationsByUser,
  getPublicationById,
  updatePublication,
  deletePublication
};
