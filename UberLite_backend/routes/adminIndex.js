var express = require('express');
var router = express.Router();
var db = require('../db/DB.js');

// router.post('/adminLogin',
//  function(req, res, next) {
//    var r = {};
//   db.findOneAdmin(req.body, function(err, thing){
//     console.log(thing);
//     if(err){
//       r.success = false;
//       r.msg = err;
//       res.send(r);
//     }
//     else if(!(thing == null)&&thing.password === req.body.password) {
//       var userObj = {username: thing.username, password: thing.password};
//       req.session.user = userObj;
//       r.success = true;
//       r.data = thing;
//       res.send(r);
//     }
//     else{
//       r.success = false;
//       res.send(r);
//     }
//   });
// });

//all the picture getting from here
router.get('/picture/:id',function(req,res,next){
  var r = {};
  db.findPictureById(req.params.id,function(err,thing){
    if (err) {
      r.success=false;
      r.msg=err;
      res.send(r);
    }
    else {
      r.data=thing;
      r.success=true;
      res.send(r);
    }
  });
});


router.get('/showPicture/:filename', function(req, res){
    console.log('@@@@@@@@@');
    var readstream = gfs.createReadStream({filename: req.params.filename});
      console.log(req.params.filename);
    readstream.on("error", function(err){
      console.log('==========');
      res.send("No image found with that title");
    });
    readstream.pipe(res);



});

// function requireAuthentication(req, res, next){
//   console.log(req.session);
//   if(req.session && req.session.user){
//     db.findOneAdmin(req.session.user, function(err, result){
//       if(!err && !(result === null) && result.password === req.session.user.password){
//         next();
//       }
//       else{
//         req.session.user = {};
//         res.status(403).send();
//       }
//     });
//   }
//   else{
//     req.session.user = {};
//     res.status(403).send();
//   }
// }
//
// router.use('/adminAPI', requireAuthentication);
function ensureAuthenticated(req, res, next) {
  console.log(req.session);
  var r = {};
    if (req.isAuthenticated()) {
      return next(); }
    r.success=false;
    r.msg="authenticate user failed";
    res.status(302).send(r);
  };
//to search drivers
router.get('/drivers',ensureAuthenticated, function(req, res, next) {
  var obj = {}, r = {};
  for(var key in req.query){
    if(req.query[key]) obj[key] = req.query[key];
  }
  db.findDrivers(obj, function(err, drivers){
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      r.success = true;
      r.data = drivers;
      res.send(r);
    }
  });
})

router.get('/driver/:id', ensureAuthenticated,function(req, res, next) {
  var r = {};
  db.findDriverById(req.params.id, function(err, drivers){
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      r.success = true;
      r.data = drivers;
      res.send(r);
    }
  });
})

//to active driver
router.put('/activeDriver',ensureAuthenticated,function(req,res,next){
  var r = {};
  db.activeDriver(req.body, function(err, result){
    if (err) {
      r.success = false;
      r.msg = err;
    }
    else {
      r.success = true;
      res.send(r);
    }
  });
});

router.put('/driver/:id',ensureAuthenticated,function(req,res,next){
  var r = {};
  db.updateDriver(req.params.id, req.body, function(err, result){
    if (err) {
      r.success = false;
      r.msg = err;
    }
    else {
      r.success = true;
      res.send(r);
    }
  });
});

//to search riders
router.get('/riders',ensureAuthenticated, function(req, res, next) {
  var obj = {}, r = {};
  for(var key in req.query){
    if(req.query[key]) obj[key] = req.query[key];
  }
  db.findRiders(obj, function(err, riders){
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      r.success = true;
      r.data = riders;
      res.send(r);
    }
  });
})

router.get('/rider/:id',ensureAuthenticated, function(req, res, next) {
  var r = {};
  db.findRiderById(req.params.id, function(err, rider){
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      r.success = true;
      r.data = rider;
      res.send(r);
    }
  });
})



module.exports = router;
