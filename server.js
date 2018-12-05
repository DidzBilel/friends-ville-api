const express = require("express");
const bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser");
const upload = require("multer");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const nJwt = require("njwt");
const bcrypt = require("bcrypt"),
  saltRounds = 10;
const _ = require("lodash");

const uuidV4 = require("uuid/v4");
var secretKey = uuidV4();

// - Services.
const db = require("./db"),
  userService = require("./services/userService"),
  publicationService = require("./services/publicationService"),
  relationService = require("./services/relationService"),
  profilePublicationService = require('./services/profilePublicationService');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// - Connection to Database and initilize the app after the connection is Ready.
isConnectionReady = false;
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://heroku_qff7x6qr:56hlb6iv223pub6481sk018ed5@ds125574.mlab.com:25574/heroku_qff7x6qr",
  function(err, client) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  },
  { useMongoClient: true }
);
// Initialize the app
var server = app.listen(process.env.PORT || 8888, function() {
  var port = server.address().port;
  console.log("App is running on port :", port);
});

// Generic error handler for all data retrieval.
function handleError(res, socket, reason, message, code) {
  console.log("Error:", reason);
  if (res !== "") {
    res.status(code || 500).json({ error: message });
  } else if (socket !== "") {
    socket.emit("error", { error: message });
  }
}

function createToken(user, res) {
  if (user.token === undefined || user.token === null) {
    var claims = {
      sub: user._id,
      iss: "https://friends-ville-api.herokuapp.com"
    };
    if (user.isAdmin === false) {
      claims.permissions = ["see-profile", "messaging", "homepage"];
    } else {
      claims.permissions = ["all"];
    }
    user.isOnline = true;
    var userToSend = _.cloneDeep(user);
    var jwt = nJwt.create(claims, secretKey);
    userToSend.token = jwt.compact();
    if (res) {
      res
        .status(200)
        .json({ sucess: true, user: userToSend, token: userToSend.token });
    } else {
      return userToSend;
    }
  }
}

const io = require("socket.io")(server);
io.on("connection", function(socket) {
  app.post("/api/relations/", function(req, res) {
    relationService
      .createNewRelation(req.body)
      .then(relation => {
        io.emit("updateUserFromPendingRelation", relation);
        res.status(200).json(relation) || res.send({ relation: relation });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to create a new Relation [SERVER.JS]"
        );
      });
  });

  app.get("/api/relations/sent/:userId", function(req, res) {
    relationService
      .getAllSentRelations(req.params.userId)
      .then(sentFriends => {
        socket.emit("sentRelations", sentFriends);
        res.status(200).json(sentFriends) ||
          res.send({ sentFriends: sentFriends });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get sent relations");
      });
  });

  app.get("/api/relations/confirmed/:userId", function(req, res) {
    relationService
      .getConfirmedRelationsByUser(req.params.userId)
      .then(confirmedFriends => {
        socket.emit("confirmedRelations", confirmedFriends);
        res.status(200).json(confirmedFriends) ||
          res.send({ confirmedFriends: confirmedFriends });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get confirmed relations");
      });
  });

  app.put("/api/relations/:id", function(req, res) {
    relationService
      .updateRelation(req.body)
      .then(relation => {
        io.emit("updateRelationWithUser", relation);
        res.send({
          success: true,
          message:
            "Update relation between " +
            relation.sender.login +
            " & " +
            relation.reciever.login +
            " successfully."
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to update relation [SERVER.JS]",
          req.statusCode
        );
      });
  });

  app.delete("/api/relations/:id", function(req, res) {
    relationService
      .deleteRelation(req.params.id)
      .then(relation => {
        io.emit("deletedRelationUser", relation);
        res.send({
          success: true,
          message:
            "Delete relation " + relation._id + " successfully. [SERVER.JS]"
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to remove relation [SERVER.JS]."
        );
      });
  });

  app.delete("/api/relations/sent/:userId/:friendId", function(req, res) {
    relationService
      .deleteSentRelation(req.params.userId, req.params.friendId)
      .then(relation => {
        io.emit("deletedRelationUser", relation);
        res.send({
          success: true,
          message:
            "Delete relation " + relation._id + " successfully. [SERVER.JS]"
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to remove relation [SERVER.JS]."
        );
      });
  });

  app.delete("/api/relations/confirmed/:friendId/:userId", function(req, res) {
    relationService
      .deleteConfirmedRelation(req.params.friendId, req.params.userId)
      .then(relation => {
        io.emit("deletedRelationUser", relation);
        res.send({
          success: true,
          message:
            "Delete relation " + relation._id + " successfully. [SERVER.JS]"
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to remove relation [SERVER.JS]."
        );
      });
  });

});

  // API Routes - Users
  /*
 * '/api/users' 
 * GET: finds all users
 * POST: creates new user
 */
  app.get("/api/users", function(req, res) {
    db.fetchAllUsers()
      .then(users => {
        res.status(200).json(users) || res.send({ users: users });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get Users [SERVER.JS]");
      });
  });

  app.post("/api/users", function(req, res) {
    var userToSend = createToken(req.body);
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if (err) {
        throw err + "error bcrypt genSalt";
      } else {
        bcrypt.hash(userToSend.password, salt, function(error, hash) {
          if (error) {
            throw error + "error bcrypt hash";
          } else {
            userToSend.password = hash;
            userService
              .createNewUser(userToSend)
              .then(user => {
                res.send({
                  token: userToSend.token,
                  id: user._id,
                  success: true,
                  message: "user " + user.login + " saved successfully !"
                });
              })
              .catch(err => {
                handleError(
                  res,
                  "",
                  err.message,
                  "Failed to create new user [SERVER.JS]"
                );
              });
          }
        });
      }
    });
  });

  /**
   *  '/api/users/:id'
   * '/api/users/:login'
   * '/api/users/search/:name'
   * '/api/users/sendpass/:login'
   * GET: find user by name
   * GET: find user by login
   * GET: find user by id
   * PUT: update users by id
   * DELETE: deletes user by id
   */
  app.get("/api/users/search/:term", function(req, res) {
    userService
      .getUsersByTerms(req.params.term)
      .then(users => {
        res.status(200).json(users) || res.send({ users: users });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get users by name");
      });
  });

  // Password mail sending by login.
  app.get("/api/users/sendpass/:login", function(req, res) {
    userService
      .getUserByLogin(req.params.login)
      .then(user => {
        res.status(200).json({ success: true, mail: user.mail }) ||
          res.send({ success: true, mail: user.mail });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to get users by login for sending password"
        );
        res.send({ success: false });
      });
  });

  app.post("/api/users/connect/:login", function(req, res) {
    userService
      .getUserByLogin(req.params.login)
      .then(user => {
        if (req.params.login === user[0].login) {
          bcrypt.compare(req.body.password, user[0].password, function(
            err,
            response
          ) {
            if (err) {
              throw err.message + " bcrypt compare error";
            } else {
              if (response === true) {
                createToken(user[0], res);
              } else {
                res.status(404).json({
                  sucess: false,
                  message: "Couple login/mot de passe incorrect"
                });
              }
            }
          });
        }
      })
      .catch(err => {
        console.log("error", err.message);
      });
  });

  app.get("/api/users/:login", function(req, res) {
    userService
      .getUserByLogin(req.params.login)
      .then(user => {
        res.status(200).json(user) || res.send({ user: user });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get user by login");
      });
  });

  app.get("/api/users/user/:id", function(req, res) {
    userService
      .getUserById(req.params.id)
      .then(user => {
        res.status(200).json(user) || res.send({ user: user });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to get the user by ID [SERVER.JS]"
        );
      });
  });

  app.put("/api/users/:id", function(req, res) {
      userService
      .updateUser(req.body)
      .then(user => {
        res.send({
          success: true,
          user: user,
          message: "Update user " + user.login + " successfully."
        });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to update user [SERVER.JS]");
      });
  
  });

  app.delete("/api/users/:id", function(req, res) {
    relationService.getAllRelationsByUser(req.params.id)
    .then(relations => {
      if(relations.length > 0){
        for(var i = 0; i < relations.length; i++) {
          relationService.deleteRelation(relations[i]._id)
          .then(relation => {
            console.log('deleted Relation between', relation.sender.login, 'and', relation.reciever.login);
          })
          .catch(err => {
            handleError(
              res,
              "",
              err.message,
              "Failed to remove relation " + relation._id
            );
          })
        };
      }
      userService
      .deleteUser(req.params.id)
      .then(user => {
        res.send({
          success: true,
          message: "Delete user " + user.login + " successfully. [SERVER.JS]"
        });
      })
      .catch(err => {
        if (err) {
          handleError(
            res,
            "",
            err.message,
            "Failed to remove user " + user.login
          );
        }
      });
    }).catch(e => {
      handleError(
        res,
        "",
        err.message,
        "Failed get all Relation for user "
      );
    });
  });

  // API Routes - Relations

  /**
   * '/api/relations
   * GET: find all relations
   * POST: create a new relation.
   */
  app.get("/api/relations", function(req, res) {
    db.fetchAllRelations()
      .then(relations => {
        res.status(200).json(relations) || res.send({ relations: relations });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to get all Relations [SERVER.JS]"
        );
      });
  });

  

  /**
   * '/api/relations/:id'
   * GET: find a relation by id
   * PUT: update a relation by id
   * DELETE: delete a relation by id
   */
  app.get("/api/relations/:id", function(req, res) {
    relationService
      .getRelationById(req.params.id)
      .then(relation => {
        res.status(200).json(relation) || res.send({ relation: relation });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get Relation by ID");
      });
  });

  app.get("/api/relations/sender/:senderId", function(req, res) {
    relationService
      .getRelationsBySender(req.params.senderId)
      .then(relations => {
        res.status(200).json(relations) || res.send({ relations: relations });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get relations by sender");
      });
  });

  app.get("/api/relations/reciever/:recieverId", function(req, res) {
    relationService
      .getRelationsByReciever(req.params.recieverId)
      .then(relations => {
        res.status(200).json(relations) || res.send({ relations: relations });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get relation by reciever");
      });
  });

  // API Routes - Publications

  /*
 * '/api/publications' 
 * GET: finds all publications, finds all publications by user.
 * POST: creates new publication
 */
  app.get("/api/publications", function(req, res) {
    db.fetchAllPublications()
      .then(publications => {
        res.status(200).json(publications) ||
          res.send({ publications: publications });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to fetch all publications");
      });
  });

  app.get("/api/publications/users/:userId", function(req, res) {
    publicationService
      .getPublicationsByUser(req.params.userId)
      .then(publications => {
        res.status(200).json(publications) ||
          res.send({ publications: publications });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to get publications for the user " + req.params.userId
        );
      });
  });

  app.post("/api/publications", function(req, res) {
    publicationService
      .createNewPublication(req.body)
      .then(publication => {
        res.status(200).json(publication) ||
          res.send({ publication: publication });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to create publication");
      });
  });

  /**
   *  '/api/publications/:id'
   * GET: find publications by id
   * PUT: update publications by id
   * DELETE: deletes publication by id
   */
  app.get("/api/publications/:id", function(req, res) {
    publicationService
      .getPublicationById(req.params.id)
      .then(publication => {
        res.status(200).json(publication) ||
          res.send({ publication: publication });
      })
      .catch(err => {
        handleError(res, "", err.message, "Failed to get publication by Id");
      });
  });

  app.put("/api/publications/:id", function(req, res) {
    publicationService
      .updatePublication(req.body)
      .then(publication => {
        res.send({
          success: true,
          message: "Update publication " + publication._id + " successfully."
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to update publication [SERVER.JS]"
        );
      });
  });

  app.delete("/api/publications/:id", function(req, res) {
    publicationService
      .deletePublication(req.params.id)
      .then(publication => {
        res.send({
          success: true,
          message:
            "Delete publication " +
            publication._id +
            " successfully. [SERVER.JS]"
        });
      })
      .catch(err => {
        handleError(
          res,
          "",
          err.message,
          "Failed to remove publication [SERVER.JS]."
        );
      });
  });

    // API Routes - Profile Publications

  /*
 * '/api/profilepublications' 
 * GET: finds all profile publications, finds all profile publications for user.
 * POST: creates new profile publication
 */
app.get("/api/profilepublications", function(req, res) {
  db.fetchAllProfilePublications()
    .then(profilePublications => {
      res.status(200).json(profilePublications) ||
        res.send({ profilePublications: profilePublications });
    })
    .catch(err => {
      handleError(res, "", err.message, "Failed to fetch all profile publications");
    });
});

app.get("/api/profilepublications/users/:userId", function(req, res) {
  profilePublicationService
    .getProfilePublicationsByUser(req.params.userId)
    .then(profilePublications => {
      res.status(200).json(profilePublications) ||
        res.send({ profilePublications: profilePublications });
    })
    .catch(err => {
      handleError(
        res,
        "",
        err.message,
        "Failed to get profile publications for the user " + req.params.userId
      );
    });
});

app.post("/api/profilepublications", function(req, res) {
  profilePublicationService
    .createNewProfilePublication(req.body)
    .then(profilePublication => {
      res.status(200).json(profilePublication) ||
        res.send({ profilePublication: profilePublication });
    })
    .catch(err => {
      handleError(res, "", err.message, "Failed to create profile publication");
    });
});

/**
 *  '/api/profilepublications/:id'
 * GET: find profile publications by id
 * PUT: update profile publications by id
 * DELETE: deletes profile publication by id
 */
app.get("/api/profilepublications/:id", function(req, res) {
  profilePublicationService
    .getProfilePublicationById(req.params.id)
    .then(profilePublication => {
      res.status(200).json(profilePublication) ||
        res.send({ profilePublication: profilePublication });
    })
    .catch(err => {
      handleError(res, "", err.message, "Failed to get publication by Id");
    });
});

app.put("/api/profilepublications/:id", function(req, res) {
  profilePublicationService
    .updateProfilePublication(req.body)
    .then(profilePublications => {
      res.send({
        success: true,
        message: "Update profile publication " + profilePublications._id + " successfully."
      });
    })
    .catch(err => {
      handleError(
        res,
        "",
        err.message,
        "Failed to update profile publication [SERVER.JS]"
      );
    });
});

app.delete("/api/profilepublications/:id", function(req, res) {
  profilePublicationService
    .deleteProfilePublication(req.params.id)
    .then(profilePublication => {
      res.send({
        success: true,
        message:
          "Delete profile publication " +
          profilePublication._id +
          " successfully. [SERVER.JS]"
      });
    })
    .catch(err => {
      handleError(
        res,
        "",
        err.message,
        "Failed to remove publication [SERVER.JS]."
      );
    });
});


