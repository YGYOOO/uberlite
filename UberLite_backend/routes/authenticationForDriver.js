var express = require('express');
var router = express.Router();
var db = require('../db/DB.js');
var flash = require('connect-flash');
var check = require('syntax-error');
var nodemailer = require('nodemailer');
var fs = require("fs");
var User = require('../userModel/riderModel'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    nev = require('email-verification')(mongoose);
//mongoose.connect('mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite');

//hash password
var passwordHash = require('password-hash');
//var hashedPassword = passwordHash.generate('password123');


var User = require('../userModel/driverModel');

var multer = require("multer");
var upload = multer({dest: "../public/uploads"});


var gfs;

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  router.use(flash());
  // router.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
  router.use(passport.initialize());
  router.use(passport.session()); //


  //
  // passport.serializeUser(function(user, done) {
  //   done(null, user._id);
  // });
  //
  // passport.deserializeUser(function(id, done) {
  //   db.findDriverById(id, function(err, user) {
  //     done(err, user);
  //   });
  // });

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
  }
,
    function(req,email, password, done) {
      db.findOneDriver({ email: req.body.email }, function(err, user) {
          console.log("================");
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        if (!passwordHash.verify(req.body.password,user.password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));



router.post('/driverLogin', function(req, res, next) {
passport.authenticate('local', function(err, user, info) {
  var r = {};
  console.log("******");
  console.log(user);
  console.log("******");
  if (err) {
    r.success=false;
    r.msg=err;
    return  res.send(r);}
  if (!user) {
     r.success=false;
     r.msg=info.msg;
     return res.send(r);
 }
  req.logIn(user, function(err) {
    if (err) {
      r.success=false;
      r.msg=err;
      res.send(r);
     }
    else {
      r.success=true;
      r.data=user;
     return  res.send(r);
    }
  });
})(req, res, next);
});

  router.get('/driverLogin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var r = {};
    if (err) {
      r.success=false;
      r.msg=err;
      return  res.send(r);
      }
    if (!user) {
      r.success=false;
      r.msg=info.msg;
      return res.send(r);
    }
    req.logIn(user, function(err) {
      if (err) {
        r.success=false;
        r.msg=err;
        res.send(r);
       }
      else {
        r.success=true;
        r.data=user;
       return  res.send(r);
      }
    });
  })(req, res, next);
});

router.get('/driverLogout', function(req, res){
  var r ={};
req.logout();
r.msg="logout success";
return res.send(r);
});


function ensureAuthenticated(req, res, next) {
  console.log(req.session);
  var r = {};
    if (req.isAuthenticated()) {
      return next(); }
    r.success=false;
    r.msg="authenticate user failed";
    res.status(302).send(r);
  };



module.exports = router;
