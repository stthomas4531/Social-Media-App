var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var models = require('../models');

router.get('/', function(req, res, next) {
    models.posts
      .findAll({include: [{ model: models.posts }]})
      .then(postsFound => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(postsFound));
      });
  });

router.get('/:id', function(req, res, next) {
    models.posts
      .findOne({ 
        include: [{ model: models.posts }], 
        where: { posts_id: parseInt(req.params.id) }
      })
      .then(postsFound => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(postsFound));
      })
  });

router.post('/', function (req, res, next) {
    models.posts.create(req.body)
      .then(newPosts => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(newPosts));
      })
      .catch(err => {
        res.status(400);
        res.send(err.message);
      });
  });

router.delete("/:id", function (req, res, next) {
    let userId = parseInt(req.params.id);
    models.users
        .destroy({
            where: { users_id: userId }
        })
        .then(result => res.redirect('/users'))
        .catch(err => {
            res.status(400);
            res.send("There was a problem deleting the actor. Please make sure you are specifying the correct id.");
        }
        );
});

router.put("/:id", function (req, res, next) {  
  let userId = parseInt(req.params.id);
  models.userId
    .update(req.body, { where: { users_id: userId } })
    .then(result => res.redirect('/users/' + userId))
    .catch(err => {
        res.status(400);
        res.send("There was a problem updating the user.  Please check the user information.");
    });
});

module.exports = router;