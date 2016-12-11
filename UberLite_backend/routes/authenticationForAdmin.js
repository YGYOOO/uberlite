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



var multer = require("multer");
var upload = multer({dest: "../public/uploads"});


var gfs;

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  router.use(flash());
  // router.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
  router.use(passport.initialize());
  router.use(passport.session()); //



  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    db.findAdminById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'username',
    passwordField: 'password'
  }
,
    function(req,username, password, done) {
      db.findOneAdmin({username: req.body.username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if ((req.body.password!=user.password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));




router.post('/adminLogin', function(req, res, next) {
passport.authenticate('local',function(err,user, info) {
  var r = {};
    console.log(req.body.username);
    console.log(user);
    console.log(req.body.password);
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
      console.log(req.isAuthenticated());
      r.success=true;
      r.data=user;
     return  res.send(r);
    }
  });
})(req, res, next);
});

router.get('/admin/:username',function(req,res,next){
  var r = {};
    db.findOneAdmin({username: req.params.username },function(err,user){
      if (err) {
        r.success=false;
        r.msg=err;
        return  res.send(r);
        }
        else {
          r.success=true;
          r.data=user;
         return  res.send(r);
        }
    })
})

router.get('/adminLogin', function(req, res, next) {
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
      console.log(req.isAuthenticated());
      r.success=true;
      r.data=user;
     return  res.send(r);
    }
  });
})(req, res, next);
});

router.get('/adminLogout', function(req, res){
var r ={};
req.logout();
r.msg="logout success";
return res.send(r);
});


function ensureAuthenticated(req, res, next) {
  var r = {};
    if (req.isAuthenticated()) {
      return next(); }
    r.success=false;
    r.msg="authenticate admin failed";
    res.status(302).send(r);
  };


module.exports = router;
