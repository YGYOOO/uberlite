var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg');

var redis = require('redis');
var client = redis.createClient(6380,'UberLite.redis.cache.windows.net', {auth_pass: '2zdj/rRAD8Uo/9zrSK5BUl9asvLtyU4ZRyIYmlFekb8=', tls: {servername: 'UberLite.redis.cache.windows.net'}});
 // Add your cache name and access key.
 var geo = require('georedis').initialize(client,{
   zset:'mySpecialLocationsSet',
   nativeGeo:false
 });
var riderStartLocation = geo.addSet('riderStartLocation');
var driverCurrentLocation = geo.addSet('driverCurrentLocation');
// riderStartLocation.delete();
// driverCurrentLocation.delete();

var db = require('../db/DB.js');
var check = require('syntax-error');
var nodemailer = require('nodemailer');
var fs = require("fs");
var User = require('../userModel/driverModel'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    nev = require('email-verification')(mongoose);
mongoose.connect('mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite');

//hash password
var passwordHash = require('password-hash');
//var hashedPassword = passwordHash.generate('password123');


const WATING = "WATING";
const ACCEPTED = "ACCEPTED";
const RIDING = "RIDING";
const DONE = "DONE";

var multer = require("multer");
var upload = multer({dest: "../public/uploads"});


var validator = require('express-validator');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(validator());

var gfs;

var Grid = require("gridfs-stream");
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  router.get("/", function(req,res){

  });
  });


nev.configure({
  persistentUserModel: User,
  expirationTime: 600000, // 10 minutes
  tempUserModel:null,
  emailFieldName: 'email',
  tempUserCollection: 'temporary_drivers',
  verificationURL: 'http://localhost:3000/email-verification/${URL}',
  // URLFieldName:'GENERATED_VERIFYING_URL',

  transportOptions: {
    service: 'Gmail',
    auth: {
      user: 'chaohui.xu1@gmail.com',
      pass: 'as65249258',
      host: 'smtp.gmail.com',
      tls: true
    }
  },
  verifyMailOptions: {
        from: 'LiteUber<user@gmail.com>',
        subject: 'Confirm your account',
        html: '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
                'paste the following link into your browser:</p><p>${URL}</p>',
        text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
    },

  //hashingFunction: myHasher,
  passwordFieldName: 'password',
}, function(err, options) {
  if (err) {
    return;
  }

});

nev.generateTempUserModel(User, function(err, tempUserModel) {
  if (err) {
    return;
  }
});
// using a predefined file

//choose picture
router.post('/drivers/:email/shot', upload.single('driverShot'), function (req, res, next) {
  // req.file is the `dirvershot` file
  // req.body will hold the text fields, if there were any
  var r = {};
  var head_writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    //filename: email+"_headshot"
  });
  head_writestream.on('close', function (file) {
    // do something with `file`
     db.updatePicture(file._id,{email: req.params.email, type: 'driverShot'},function(err, result){
       if (err) {
         r.success = false;
         r.msg = err;
         res.send(r);
       }
       else {
         r.success = true;
         res.send(r);
       }
     });
  });
  fs.createReadStream("../public/uploads/" + req.file.filename)
    .on("end", function(){
      fs.unlink("../public/uploads/"+ req.file.filename, function(err){})
    })
    .on("err", function(){res.send("Error uploading image")})
      .pipe(head_writestream);
  });
//car picture
//choose picture
router.post('/drivers/:email/carShot', upload.single('driverCarShot'), function (req, res, next) {
  // req.file is the `dirvershot` file
  // req.body will hold the text fields, if there were any
  var r = {};
  var head_writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    //filename: email+"_headshot"
  });
  head_writestream.on('close', function (file) {
    // do something with `file`
     db.updatePicture(file._id, {email: req.params.email, type: 'driverCarShot'}, function(err, result){
       if (err) {
         r.success = false;
         r.msg = err;
         res.send(r);
       }
       else {
         r.success = true;
         res.send(r);
       }
     });
  });

  fs.createReadStream("../public/uploads/" + req.file.filename)
    .on("end", function(){
      fs.unlink("../public/uploads/"+ req.file.filename, function(err){})
    })
      .on("err", function(){res.send("Error uploading image")})
        .pipe(head_writestream);
});
//licence picture
//choose picture
router.post('/drivers/:email/licenceShot', upload.single('driverLicenceShot'), function (req, res, next) {
  // req.file is the `dirvershot` file
  // req.body will hold the text fields, if there were any
  var r = {};
  var head_writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    //filename: email+"_headshot"
  });
  head_writestream.on('close', function (file) {
    // do something with `file`
     db.updatePicture(file._id, {email: req.params.email, type: 'driverLicenceShot'}, function(err, result){
       if (err) {
         r.success = false;
         r.msg = err;
         res.send(r);
       }
       else {
         r.success = true;
         res.send(r);
       }
     });
  });
  fs.createReadStream("../public/uploads/" + req.file.filename)
    .on("end", function(){
      fs.unlink("../public/uploads/"+ req.file.filename, function(err){})
    })
      .on("err", function(){res.send("Error uploading image")})
        .pipe(head_writestream);
  });


//
router.post('/drivers/:email/registrationInfo', function(req, res) {

  req.checkBody("email", "Enter a valid email address.").isEmail();
  req.checkBody("password", "Enter a valid password.").notEmpty();
  req.checkBody("full_name", "Enter a valid name.").notEmpty();
  req.checkBody("licence_number", "Enter a valid creditCard number.").isAlphanumeric();
  req.checkBody("creditCard_name", "Enter a valid creditCard name.").notEmpty();
  req.checkBody("age", "Enter a valid age.").isInt();
  req.checkBody("sex", "Enter a valid sex.").isAlpha();
  req.checkBody("car_type","Enter a valid car type").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
    // normal processing here

  var email = req.params.email;
  //get picture
  var driverP = {};
  var carP ={};
  var licenceP = {};
  var obj = {};
  // for(var key in req.query){
  //   if(req.query[key]) obj[key] = req.query[key];
  // }
  db.findPictures({email: email}, function(err, pictures){
    var r = {};
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      var driver_p_id;
      var car_p_id;
      var licence_p_id;
      pictures.forEach(function(p){
        switch(p.type){
          case 'driverShot':
            driver_p_id = p._id;
            break;
          case 'driverCarShot':
            car_p_id = p._id;
            break;
          case 'driverLicenceShot':
            licence_p_id = p._id;
        }
      })

      var password = req.body.password;
      var hashedPassword = passwordHash.generate(password);
      var full_name = req.body.full_name;
      var licence_number = req.body.licence_number;
      var age = req.body.age;
      var sex = req.body.sex;
      var car_type = req.body.car_type;
      var score=5;
      var newUser = new User({
       email: email,
       password: hashedPassword,
       full_name:full_name,
       age:age,
       sex:sex,
       score:score,
       licence_number:licence_number,
       active:false,
       authorized:false,
       car_type:car_type,
       driver_picture:driver_p_id,
       car_picture:car_p_id,
       licence_picture:licence_p_id
      });

      nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
        if (err) return res.status(404).send('ERROR: creating temp user FAILED');

        var r = {};
        r.success = true;
        if (existingPersistentUser) {
          r.msg = 'You have already signed up and confirmed your account. Did you forget your password?';
          return res.send(r);
        }
        else if (newTempUser) {
          var URL = newTempUser[nev.options.URLFieldName];
          nev.sendVerificationEmail(email, URL, function(err, info) {
            if (err) {
              r.success = false;
              r.msg = 'Sending email failed.';
              db.deleteDriverInTemp(email,function(err,result){
                if (err) {
                  r.msg = 'delete driver in temp failed';
                }
                else {
                  r.msg = 'delete success';
                }
              })
              return res.send(r);
            }
            r.msg='An email has been sent to you. Please check it to verify your account.';
            res.send(r);
          });
        }
        else {
          r.msg= 'You have already signed up. Please check your email to verify your account.';
          res.send(r);
        }
      });
    }
  });

}//valid
});

router.post('/driverRegisterResend',function(req,res){
  var email = req.body.email;
   nev.resendVerificationEmail(email, function(err, userFound) {
     if (err) {
       return res.status(404).send('ERROR: resending verification email FAILED');
     }
     if (userFound) {
       res.json({
         msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
       });
     } else {
       res.json({
         msg: 'Your verification code has expired. Please sign up again.'
       });
     }
   });
});

// user accesses the link that is sent
router.get('/email-verification/:URL', function(req, res) {
  var url = req.params.URL;
  nev.confirmTempUser(url, function(err, user) {
    if (user) {
      nev.sendConfirmationEmail(user.email, function(err, info) {
        if (err) {
          return res.status(404).send('ERROR: sending confirmation email FAILED');
        }
        res.json({
          msg: 'CONFIRMED!',
          info: info
        });
      });
    } else {
      return res.status(404).send('ERROR: confirming temp user FAILED');
    }
  });
});

function ensureAuthenticated(req, res, next) {
    var r = {};
      if (req.isAuthenticated()) {
        return next(); }
      r.success=false;
      r.msg="authenticate user failed";
      res.status(302).send(r);
  };

//get driver by email
router.get('/drivers/:email', function(req,res){
  var currentEmail = req.params.email;
  db.findOneDriverByEmial(currentEmail,function(err,thing){
    var r = {};
    if (err) {
      r.success = false;
      r.msg = err;
      res.status(500);
      res.send(r);
    }
    else if (!thing) {
      r.success = false;
      r.msg = err;
      res.status(404);
      res.send(r);
    }
    else {
      r.data=thing;
      r.success = true;
      res.status(200);
      res.send(r);
    }
  });
});

router.get('/riders/:email',ensureAuthenticated,function(req,res){
  db.findOneRiderByEmial(req.params.email,function(err,thing){
    var r = {};
    if (err) {
      r.success = false;
      r.msg = err;
      res.status(500);
      res.send(r);
    }
    else if (!thing) {
      r.success = false;
      r.msg = err;
      res.status(404);
      res.send(r);
    }
    else {
      r.data = {
        full_name: thing.full_name
      };
      r.success = true;
      res.status(200);
      res.send(r);
    }
  });
});

var options = {
  withCoordinates: true, // Will provide coordinates with locations, default false
  // withHashes: true, // Will provide a 52bit Geohash Integer, default false
  // withDistances: true, // Will provide distance from query, default false
  // order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
  // units: 'km', // or 'km', 'mi', 'ft', default 'm'
  // count: 100, // Number of results to return, default undefined
  // accurate: true // Useful if in emulated mode and accuracy is important, default false
};

router.get('/geo/riders',ensureAuthenticated,function(req,res){
      var lo = req.query.longitude;
      var la = req.query.latitude;
      var radius = req.query.radius;
      var car_type = req.query.car_type;
      riderStartLocation.radius({longitude:lo,latitude:la},radius,options,function(err,reply){
        let ridingRequests = [];
        let asynCount = reply.length;
        if(asynCount <= 0) {
          var re ={};
          re.success=true;
          re.msg= "search nearby riders success";
          re.data = ridingRequests;
          return res.send(re);
        }
        reply.forEach(function(rider) {
          client.get("ridingRequest:"+rider.key, function(err,ridingRequest){
            ridingRequest = JSON.parse(ridingRequest);
            if(ridingRequest.status == WATING && ridingRequest.car_type == car_type){
              ridingRequests.push(rider);
            }
            asynCount--;
            if(asynCount <= 0) {
              var re ={};
              if (err) {
                re.success=false;
                re.msg = "search nearby riders failed";
                return res.send(re);
              }
              else {
                re.success=true;
                re.msg= "search nearby riders success";
                re.data = ridingRequests;
                return res.send(re);
              }
            }
          });
        });
      });
});


router.put('/ridingRequests/:email',ensureAuthenticated,function(req,res){

  req.checkParams("email", "Enter a valid email address.").notEmpty();
  // req.checkBody("currentLatitude", "Enter a valid current Latitude.").notEmpty();
  // req.checkBody("currentLongitude", "Enter a valid current Longitude.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
    // normal processing here
  var driver_email=req.body.email
  var currentLatitude=req.body.currentLatitude;
  var currentLongitude=req.body.currentLongitude;
  var r = {};
  client.get("ridingRequest:"+req.params.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg=err;
      return res.send(r);
    }//does not exist this rider
    else if(reply==null){
      r.success=false;
      r.msg="this rider is not in the riderRequest set";
      return res.send(r);
    }
    else {
      //first to delete this rider from riderStartLocation
      reply = JSON.parse(reply);
      var ridingRequestInfo = {
        startLocation: reply.startLocation,
         endLocation: reply.endLocation,
         full_name:reply.full_name,
         phone:reply.phone,
         gcm_token: reply.gcm_token
      }
      if (reply.status!=WATING) {
        r.success=false;
        r.msg="This rider's request has been accepted by another driver.";
        return res.send(r);
      }else if(reply.car_type!=req.body.car_type){
        r.success=false;
        r.msg="This rider's request "+reply.car_type+" type car.";
        return res.send(r);
      }
      else {
        riderStartLocation.removeLocation(req.params.email,function(err,reply){
          if (err) {
            r.success=false;
            r.msg=err;
            return res.send(r);
          }else //delete success and update riderRequest info
          {
            ridingRequestInfo.status=ACCEPTED;
            ridingRequestInfo.driver_email=driver_email;
            client.set("ridingRequest:"+req.params.email, JSON.stringify(ridingRequestInfo),function(err,reply){
              if (err) {
                r.success=false;
                r.msg= err;
                return res.send(r);
              }//update ridingRequest finish
              else {
                driverCurrentLocation.addLocation(driver_email,{longitude:currentLongitude,latitude:currentLatitude},function(err,reply){
                  if (err) {
                    r.success=false;
                    r.msg= err;
                    return res.send(r);
                  }
                  else {
                    var message = new gcm.Message({
                        data: {status: ACCEPTED,  driver_email: ridingRequestInfo.driver_email, driver_gcm_token: req.body.driver_gcm_token}
                    });
                    sender.send(message, { registrationTokens: [ridingRequestInfo.gcm_token.token] }, function (err, response) {
                      if (err) console.error(err);
                      // else console.log(response);
                    });
                    r.success=true;
                    r.msg= "accepted rider request success";
                    r.data=ridingRequestInfo;
                    return res.send(r);
                  }
            });
          }
        });
      }
    });
    }
  }
});

}//valid
});



router.put('/ridingRequests/:email/status',ensureAuthenticated,function(req,res){
  req.checkBody("status", "Enter a valid status.").isAlpha();
  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
    // normal processing here
  var r = {};
  var status = req.body.status;
  var current_driver_email=req.user.email;
  client.get("ridingRequest:"+req.params.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r);
    }
    else {
      reply = JSON.parse(reply);
      if (reply.driver_email==current_driver_email) {
        if (req.body.status==RIDING) {
          if (reply.status==ACCEPTED) {
            reply.status=RIDING;
            client.set("ridingRequest:"+req.params.email,JSON.stringify(reply),function(err,result){
              if (err) {
                r.success=false;
                r.msg= err;
                return res.send(r);
              }
              else {
                //send gcm
              }
            })
          }
          else {
            r.success=false;
            //send a err msg
            r.msg= "";
            return res.send(r);
          }
        }else if (req.body.status==DONE) {
            if (reply.status==RIDING) {
              reply.status=DONE;
              client.set("ridingRequest:"+req.params.email,JSON.stringify(reply),function(err,result){
                if (err) {
                  r.success=false;
                  r.msg= err;
                  return res.send(r);
                }
                else {
                  //send gcm
                }
              })
        }
        else {
          r.success=false;
          r.msg= "";
          return res.send(r);
        }
      }
      else {
        r.success=false;
        r.msg= "This is not the correct pick up place";
        return res.send(r);
      }
    }else {
      r.success=false;
      r.msg= "This is not the correct pick up place";
      return res.send(r);
    }
  }
  })
}//valid
})


router.get('/ridingRequests/:email',ensureAuthenticated, function(req, res, next){
  client.get("ridingRequest:" + req.params.email, function(err, result){
    res.send(JSON.parse(result));
  })
})

router.delete('/ridingRequests/:email',ensureAuthenticated,function(req, res, next){
  client.del("ridingRequest:" + req.params.email, function(err, result1){
    riderStartLocation.removeLocation(req.params.email, function(err, result){
      if(err) return res.send(err);
      if(result1 && result) return res.send('Delete success');
      else res.send('err');
    });
  })
})

module.exports = router;
