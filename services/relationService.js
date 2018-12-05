/**
 * THIS FILE CONTAINS ALL THE TREATMENTS ABOUT THE RESULTS FROM THE DATABASE.
 * AND IS THEN EXPORTED AS A MODULE TO REUSE THE METHODS IN THE SERVER.
 */
const db = require("../db"),
  Relation = require("../models/relations");

const createNewRelation = function(relation) {
  var newRelation = new Relation({
    ...relation
  });

  return db.saveNewRelation(newRelation);
};

const getRelationById = function(id) {
  return db.fetchRelationById(id);
};

const getAllSentRelations = function(userId) {
  return db.fetchAllSentRelations(userId);
};

const getRelationsBySender = function(senderId) {
  return db.fetchRelationsBySender(senderId);
};

const getRelationsByReciever = function(recieverId) {
  return db.fetchRelationsByReciever(recieverId);
};

const getConfirmedRelationsByUser = function(userId) {
  return db.fetchAllConfirmedRelationsByUser(userId);
};

const getAllRelationsByUser = function(userId) {
  return db.fetchAllRelationsByUser(userId);
}

const getPendingRelationsByUser = function(userId){
  return db.fetchAllPendingRelationsByUser(userId);
};

const updateRelation = function(relation) {
  var relationToSave = relation;
  return db.updateRelation(relationToSave);
};

const deleteRelation = function(id) {
  return db.deleteRelation(id);
};

const deleteSentRelation = function(userId, friendId) {
  return db.deleteSentRelation(userId, friendId);
};

const deleteConfirmedRelation = function(friendId, userId) {
  return db.deleteConfirmedRelation(friendId, userId);
};

module.exports = {
  createNewRelation,
  getRelationById,
  getRelationsBySender,
  getRelationsByReciever,
  getPendingRelationsByUser,
  getConfirmedRelationsByUser,
  getAllSentRelations,
  getAllRelationsByUser,
  updateRelation,
  deleteRelation,
  deleteSentRelation,
  deleteConfirmedRelation
};
