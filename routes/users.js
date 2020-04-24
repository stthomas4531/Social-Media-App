var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var models = require('../models');
var passport = require('../services/passport');
var authService = require('../services/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.user) {
    if (req.user.Admin) {
     models.users.findAll({})
     .then(usersFound => {
       res.render('users', {users: usersFound})
     });
    } else {
      res.send("You are not authorized");
    }
  } else {
    res.redirect('login');
  }
});
  
router.get('/signup', function(req, res, next) {
  res.render('signup');
});
  
router.post('/signup', function(req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.username
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: authService.hashPassword(req.body.password)
      }
    })
    .spread(function(result, created) {
      if (created) {
        res.redirect('login');  
      } else {
        res.send('This user already exists');
      }
    });
});
  
router.get('/profile', function (req, res, next) {
  if (req.user) {
    models.users
    .findById(parseInt(req.user.UserId))
    .then(user => {
      if (user) {
        res.render('profile', {
          FirstName: user.FirstName,
          LastName: user.LastName,
          Email: user.Email,
          Username: user.Username
        });
      } else {
        res.send("User not found");
      }
    })
  } else {
    res.redirect('/users/login')
  }
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          res.send(JSON.stringify(user));
        } else {
          res.status(401);
          res.send('Invalid authentication token');
        }
      });
  } else {
    res.status(401);
    res.send('Must be logged in');
  }
});


router.get('/login', (req, res, next) => {
  res.render('login');
});


router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: {
      Username: req.body.username,
      Password: req.body.password
    }
  }).then(user => {
    if (!user) {
      console.log('User not found')
      return res.status(401).json({
        message: "Login Failed"
      });
    }
    if (user) {
      let token = authService.signUser(user); 
      res.cookie('jwt', token); 
      res.send('Login successful');
    } else {
      console.log('Wrong password');
      res.redirect('login')
    }
  });
});

router.get('/logout', function (req, res, next) {
  res.cookie('jwt', "", { expires: new Date(0) });
  res.send('Logged out');
  });

router.get('/profile/:id', function(req, res, next){
let userId = parseInt(req.params.id);
models.users
.find({
  where: {UserId: userId}
})
.then(userFound => res.render("specificUser", {user: userFound}))
});

router.post("/:id", function(req, res, next) {
  if (req.user && req.user.Admin) {
    let userId = parseInt(req.params.id);
    models.users
      .update({ Deleted: true }, { where: { UserId: userId } })
      .then(result => res.redirect("/users"))
      .catch(error => {
        res.status(400);
        res.send("error deleting user");
      });
  } else {
    res.redirect("unauthorized");
  }
});

router.get('/', function (req, res, next) {
  models.users.findAll({
    where: {
      Deleted: false
    }
  }).then(usersFound => {
    res.render('users', {
      users: usersFound
    });
  });
});




module.exports = router;