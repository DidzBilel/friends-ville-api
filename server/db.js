/**
 * THIS FILE CONTAINS ALL THE DATABASE CALLS.
 * AND IS THEN EXPORTED AS A MODULE, TO GET ACCESS TO
 * THE METHODS.
 */
const _ = require("lodash");

const User = require("./models/user");
const Publication = require("./models/publication");
const ProfilePublication = require("./models/profilePublication");
const Discussion = require("./models/discussion");
const PrivateMessage = require("./models/privateMessage");
const Relations = require("./models/relations");

const fetchAllUsers = function () {
  return new Promise((resolve, reject) => {
    User.find({}, {
      password: 0
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get all Users"
        });
      } else {
        resolve(result);
      }
    }).sort({
      _id: -1
    });
  });
};

const fetchUserById = function (id) {
  return new Promise((resolve, reject) => {
    User.findOne({
      _id: id
    }, {
      password: 0
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get Users by ID"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchUserByLogin = function (login) {
  return new Promise((resolve, reject) => {
    User.find({
      login: login
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get User by login"
        });
      } else {
        resolve(result);
      }
    });
  });
};
/* $or: [
  {
    name: { $regex: ".*" + searchTerms + ".*", $options: "i" },
    lastName: { $regex: ".*" + searchTerms + ".*", $options: "i" },
    login: { $regex: ".*" + searchTerms + ".*", $options: "i" }
  }
] */
const fetchUsersByTerms = function (searchTerms) {
  return new Promise((resolve, reject) => {
    User.find({
          name: {
            $regex: ".*" + searchTerms + ".*",
            $options: "i"
          }
        }, // Recherche tous les login contenant les "searchTerms" avec un ignoreCase
        {
          password: 0
        },
        function (err, result) {
          if (err) {
            reject({
              err,
              message: "Failed to get Users By name"
            });
          } else {
            resolve(result);
          }
        }
      )
      .sort({
        name: 1
      })
      .limit(8);
  });
};

const fetchUserByIds = function (ids) {
  return new Promise((resolve, reject) => {
    User.find({
      _id: {
        $in: ids[0]._id
      }
    }, {
      password: 0
    }, function (
      err,
      result
    ) {
      if (err) {
        reject({
          err,
          message: "Failed to get Users by IDs"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchAllRelations = function () {
  return new Promise((resolve, reject) => {
    Relations.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get all Relations"
        });
      } else {
        resolve(result);
      }
    }).sort({
      _id: -1
    });
  });
};

const fetchAllRelationsByUser = function (userId) {
  var allUserRelations = [];
  return new Promise((resolve, reject) => {
    Relations.find(function(err, result){
      if(err){
        reject({err, message: "Failed to get all relations"});
      } else {
        _.forEach(result, (value, key) => {
          if(value.reciever._id === userId){
            allUserRelations.push(value);
          } else if(value.sender._id === userId) {
            allUserRelations.push(value);
          }
        });
        resolve(allUserRelations);
      }
    });
  });
};

const fetchAllPendingRelationsByUser = function(userId) {
  var pendingTab = [];
  return new Promise((resolve, reject) => {
    Relations.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get Relations - Pending"
        });
      } else {
        _.forEach(result, (value, key) => {
          if (value.reciever._id === userId && value.status === "pending") {
            pendingTab.push(value.sender);
          } else if (
            value.sender._id === userId &&
            value.status === "pending"
          ) {
            pendingTab.push(value.reciever);
          }
        });
        resolve(pendingTab);
      }
    });
  });
};

const fetchAllSentRelations = function (userId) {
  var recieverTab = [];
  return new Promise((resolve, reject) => {
    Relations.find({
        $and: [{
          "sender._id": userId
        }, {
          status: "pending"
        }]
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to get Relations - sent"
          });
        } else {
          _.forEach(result, function (value, key) {
            if (value.sender._id === userId) {
              recieverTab.push(value.reciever);
            }
          });
          resolve(recieverTab);
        }
      }
    );
  });
};

const fetchRelationsBySender = function (senderId) {
  var relationTab = [];
  return new Promise((resolve, reject) => {
    Relations.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get Relations - Sender"
        });
      } else {
        _.forEach(result, function (value, key) {
          if (value.sender._id === senderId) {
            relationTab.push(value);
          }
        });
        resolve(relationTab);
      }
    });
  });
};

const fetchRelationsByReciever = function (recieverId) {
  var relationTab = [];
  return new Promise((resolve, reject) => {
    Relations.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get relations - Receiver"
        });
      } else {
        _.forEach(result, function (value, key) {
          if (value.reciever._id === recieverId) {
            relationTab.push(value);
          }
        });
        resolve(relationTab);
      }
    });
  });
};

const fetchAllConfirmedRelationsByUser = function (userId) {
  var confirmedTab = [];
  return new Promise((resolve, reject) => {
    Relations.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get Relations - Confirmed"
        });
      } else {
        _.forEach(result, (value, key) => {
          if (value.reciever._id === userId && value.status === "confirmed") {
            confirmedTab.push(value.sender);
          } else if (
            value.sender._id === userId &&
            value.status === "confirmed"
          ) {
            confirmedTab.push(value.reciever);
          }
        });
        resolve(confirmedTab);
      }
    });
  });
};

const fetchRelationById = function (id) {
  return new Promise((resolve, reject) => {
    Relations.find({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get Relation by ID"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchAllPublications = function () {
  return new Promise((resolve, reject) => {
    Publication.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get all Publications"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchAllProfilePublications = function () {
  return new Promise((resolve, reject) => {
    ProfilePublication.find(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get all profile publications"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchAllPublicationsForProfile = function (userId) {
  let profilePublications = [];
  function compare(a, b){
    if (a.publishDate < b.publishDate)
      return -1;
    if (a.publishDate > b.publishDate)
      return 1;
    return 0;
  }
  return new Promise((resolve, reject) => {
    ProfilePublication.find({
      "reciever.id": userId
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get publications for profile"
        });
      } else {
        Publication.find({
          "author.id": userId
        }, function (error, data) {
          if (error) {
            reject({
              error,
              message: "Failed to get profile Publications for the user"
            })
          } else {
            _.forEach(result, (value, key) => {
              profilePublications.push(value);
            });
            _.forEach(data, (value, key) => {
              profilePublications.push(value);
            });
            profilePublications.sort();
          }
        });
        profilePublications.sort(compare);
        resolve(profilePublications);
      }
    });
  });
};

const fetchPublicationsByUser = function (userId) {
  return new Promise((resolve, reject) => {
    User.find({
      _id: userId
    }, function (error, user) {
      if (error) {
        reject({
          err,
          message: "Failed to get User for publication"
        });
      } else {
        Publication.find({
          "author.id": {
            $eq: user[0]._id
          }
        }, function (
          err,
          result
        ) {
          if (err) {
            reject({
              err,
              message: "Failed to get publications for the user"
            });
          } else {
            resolve(result);
          }
        });
      }
    });
  });
};

const fetchProfilePublicationsByUser = function (userId) {
  return new Promise((resolve, reject) => {
    ProfilePublication.find({
      "author.id": userId
    }, function (
      err,
      result
    ) {
      if (err) {
        reject({
          err,
          message: "Failed to get profile publications for the user"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchPublicationById = function (id) {
  return new Promise((resolve, reject) => {
    Publication.find({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get publication By ID"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const fetchProfilePublicationById = function (id) {
  return new Promise((resolve, reject) => {
    ProfilePublication.find({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to get profile publication By ID"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const updateUser = function (userToSave) {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate({
        _id: userToSave._id
      }, {
        $set: userToSave
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to update the user."
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updateRelation = function (relationToSave) {
  return new Promise((resolve, reject) => {
    Relations.findByIdAndUpdate({
        _id: relationToSave._id
      }, {
        $set: relationToSave
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to update the relation."
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updatePublication = function (publicationToSave) {
  return new Promise((resolve, reject) => {
    Publication.findByIdAndUpdate({
        _id: publicationToSave._id
      }, {
        $set: publicationToSave
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to update the publication."
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updateProfilePublication = function (profilePublicationToSave) {
  return new Promise((resolve, reject) => {
    ProfilePublication.findByIdAndUpdate({
        _id: profilePublicationToSave._id
      }, {
        $set: profilePublicationToSave
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to update the profile publication."
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const saveNewUser = function (user) {
  return new Promise((resolve, reject) => {
    user.save(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to save Users"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const saveNewRelation = function (relation) {
  return new Promise((resolve, reject) => {
    relation.save(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to save relation"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const saveNewPublication = function (publication) {
  return new Promise((resolve, reject) => {
    publication.save(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to save publication"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const saveNewProfilePublication = function (profilePublication) {
  return new Promise((resolve, reject) => {
    profilePublication.save(function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to save profile publication"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const deleteUser = function (id) {
  return new Promise((resolve, reject) => {
    User.findByIdAndRemove({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to find the user to Delete."
        });
      } else {
        resolve(result);
      }
    });
  });
};

const deleteRelation = function (id) {
  console.log("DELETE RELATION ID", id);
  return new Promise((resolve, reject) => {
    Relations.findByIdAndRemove({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to find the relation to delete"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const deleteSentRelation = function (userId, friendId) {
  return new Promise((resolve, reject) => {
    Relations.findOneAndRemove({
        $and: [{
            "sender._id": userId
          },
          {
            "reciever._id": friendId
          },
          {
            status: "pending"
          }
        ]
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to find the sent relation to delete"
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const deleteConfirmedRelation = function (friendId, userId) {
  return new Promise((resolve, reject) => {
    Relations.findOneAndRemove({
        $or: [{
            $and: [{
              "sender._id": friendId
            }, {
              "reciever._id": userId
            }]
          },
          {
            $and: [{
              "sender._id": userId
            }, {
              "reciever._id": friendId
            }]
          }
        ]
      },
      function (err, result) {
        if (err) {
          reject({
            err,
            message: "Failed to find the relation to delete"
          });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const deletePublication = function (id) {
  return new Promise((resolve, reject) => {
    Publication.findByIdAndRemove({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to find the publication to delete"
        });
      } else {
        resolve(result);
      }
    });
  });
};

const deleteProfilePublication = function (id) {
  return new Promise((resolve, reject) => {
    ProfilePublication.findByIdAndRemove({
      _id: id
    }, function (err, result) {
      if (err) {
        reject({
          err,
          message: "Failed to find the profile publication to delete"
        });
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  fetchAllUsers,
  fetchUserById,
  fetchUserByLogin,
  fetchUsersByTerms,
  fetchUserByIds,
  fetchAllPendingRelationsByUser,
  fetchAllRelations,
  fetchAllRelationsByUser,
  fetchRelationById,
  fetchRelationsBySender,
  fetchRelationsByReciever,
  fetchAllSentRelations,
  fetchAllConfirmedRelationsByUser,
  fetchAllPublications,
  fetchAllProfilePublications,
  fetchAllPublicationsForProfile,
  fetchProfilePublicationById,
  fetchPublicationsByUser,
  fetchProfilePublicationsByUser,
  fetchPublicationById,
  updateUser,
  updateRelation,
  updatePublication,
  updateProfilePublication,
  saveNewUser,
  saveNewRelation,
  saveNewPublication,
  saveNewProfilePublication,
  deleteUser,
  deletePublication,
  deleteProfilePublication,
  deleteRelation,
  deleteConfirmedRelation,
  deleteSentRelation
};