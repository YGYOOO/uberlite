var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg');

var redis = require('redis');
var client = redis.createClient(6380,'UberLite.redis.cache.windows.net', {auth_pass: '2zdj/rRAD8Uo/9zrSK5BUl9asvLtyU4ZRyIYmlFekb8=', tls: {servername: 'UberLite.redis.cache.windows.net'}});
 // Add your cache name and access key.
 var geo = require('georedis')
 // .initialize(client,{
 //   zset:'mySpecialLocationsSet',
 //   nativeGeo:false
 // });
var riderStartLocation = geo.addSet('riderStartLocation');
var driverCurrentLocation = geo.addSet('driverCurrentLocation');
var db = require('../db/DB.js');
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

var User = require('../userModel/riderModel');
var ensureAuthentication = require('./authenticationForRider');

var multer = require("multer");
var upload = multer({dest: "../public/uploads"});


var gfs;

var Grid = require("gridfs-stream");
var conn = mongoose.connection;

//params validator
var bodyParser = require('body-parser');
var validator = require('express-validator');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(validator());


//declare const
const WATING = "WATING";

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
  tempUserCollection: 'temporary_riders',
  verificationURL: 'http://localhost:3000/rider-email-verification/${URL}',
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
    console.log(err);
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
router.post('/riders/:email/shot', upload.single('riderShot'), function (req, res, next) {
  // req.file is the `dirvershot` file
  // req.body will hold the text fields, if there were any
  var r = {};
  var head_writestream = gfs.createWriteStream({
    filename: req.file.originalname,
    //filename: email+"_headshot"
  });
  head_writestream.on('close', function (file) {
    // do something with `file`
     db.updatePicture(file._id,{email: req.params.email, type: 'riderShot'},function(err, result){
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
router.post('/riders/:email/registrationInfo', function(req, res) {


  req.checkBody("email", "Enter a valid email address.").isEmail();
  req.checkBody("password", "Enter a valid password.").notEmpty();
  req.checkBody("full_name", "Enter a valid name.").notEmpty();
  req.checkBody("creditCard_number", "Enter a valid creditCard number.").isCreditCard();
  req.checkBody("creditCard_name", "Enter a valid creditCard name.").notEmpty();
  req.checkBody("creditCard_expire", "Enter a valid creditCard expire.").isDate();
  req.checkBody("age", "Enter a valid age.").isInt();
  req.checkBody("sex", "Enter a valid sex.").isAlpha();

  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
    // normal processing here


  db.findPictures({email: req.params.email}, function(err, p){
    var r = {};
    if(err) {
      r.success = false;
      r.msg = err;
      res.send(r);
    }
    else{
      var p_id;
      if(p.type == 'riderShot'){
        p_id = p._id;
      }
    }
    var email = req.params.email;
    var password = req.body.password;
    var hashedPassword = passwordHash.generate(password);
    var full_name = req.body.full_name;
    var creditCard_number=req.body.creditCard_number;
    var creditCard_name=req.body.creditCard_name;
    var creditCard_expire=req.body.creditCard_expire;
    var age = req.body.age;
    var sex = req.body.sex;

    var newUser = new User({
     email: email,
     password: hashedPassword,
     full_name:full_name,
     age:age,
     sex:sex,
     creditCard_number:creditCard_number,
     creditCard_name:creditCard_name,
     creditCard_expire:creditCard_expire,
     rider_picture:p[0]._id
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
          var removeEmail = email;
          if (err) {
            console.log(err);
            r.success = false;
            r.msg = 'Sending email failed.';
            db.deleteRiderInTemp(email,function(err,result){
              if (err) {
                r.msg = 'delete rider in temp failed';
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
  });


  }
});



router.post('/riderRegisterResend',function(req,res){
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
router.get('/rider-email-verification/:URL', function(req, res) {
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

//system function to delete all picture except the defualt
router.get('/deleteAllExceptDefualt',function(req,res,next){
  var r = {};
  db.deletePicturesExceptD(function(err,thing){
    if (err) {
      r.msg="Delete pictues failed";
      r.success=false;
    }
    else {
      r.msg="Delete pictues success";
      r.success=true;
    }
  });
});



// //give rider by email
// router.get('/riders/:email',ensureAuthenticated,function(req,res){
//   var currentEmail = req.params.email;
//   db.findOneRiderByEmial(currentEmail,function(err,thing){
//     var r = {};
//     if (err) {
//       r.success = false;
//       r.msg = err;
//       res.status(500);
//       res.send(r);
//     }
//     else if (!thing) {
//       r.success = false;
//       r.msg = err;
//       res.status(404);
//       res.send(r);
//     }
//     else {
//       r.data=thing;
//       r.success = true;
//       res.status(200);
//       res.send(r);
//     }
//   });
// });

function ensureAuthenticated(req, res, next) {
    var r = {};
      if (req.isAuthenticated()) {
        return next(); }
      r.success=false;
      r.msg="authenticate user failed";
      res.status(302).send(r);
  };


router.post('/ridingRequests/:email',ensureAuthenticated,function(req,res){

  req.checkBody("startLocation", "Enter a valid startLocation.").notEmpty();
  req.checkBody("endLocation", "Enter a valid endLocation.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
  var key = req.params.email;
  var r = {};
  var ridingRequestInfo = {
    startLocation: req.body.startLocation,
    endLocation: req.body.endLocation,
    status: WATING,
    gcm_token: req.body.gcm_token
  };
  client.get("ridingRequest:"+req.params.email, function(err,reply){
    reply = JSON.parse(reply);
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r)
    }
    else if(!reply || reply.status=='WATING'){
      riderStartLocation.addLocation(key,ridingRequestInfo.startLocation,function(err,reply){
        if (err) {
          r.success=false;
          r.msg = "rider send start location failed";
          return res.send(r);
        }
        else {
          db.findOneRider({ email: req.params.email }, function(err, user){
            if (err) {
              r.success=false;
              r.msg= err;
              return res.send(r)
            }else {
              ridingRequestInfo.full_name=user.full_name;
              ridingRequestInfo.phone= user.phone;
              ridingRequestInfo.status=WATING;
              ridingRequestInfo.driver_email=null;
              client.set("ridingRequest:"+req.params.email, JSON.stringify(ridingRequestInfo),function(err,reply){
                if (err) {
                  r.success=false;
                  r.msg= err;
                  return res.send(r)
                }
                else {
                  r.success=true;
                  r.msg= "rider send request successfully";
                  r.data=reply;
                  return res.send(r);
                }
              });
            }
          });
          // return res.send(r);
        }
      });
    }
    else {
      r.success=false;
      r.msg= "you has send a request before";
      return res.send(r)
    }
  });

}//valid
});


router.get('/Request/:email',ensureAuthenticated, function(req, res){
  var r = {};
  client.get("ridingRequest:"+req.params.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r);
    }
    else {
      r.success=true;
      r.msg="get success";
      r.date=reply;
      return res.send(r);
    }
  });
});

router.delete('/request/:email',ensureAuthenticated,function(req,res){
  var r = {};
  client.del("ridingRequest:"+req.body.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r);
    }
    else {
      r.success=true;
      r.msg="cancel request success";
      r.date=reply;
      return res.send(r);
    }
  });
});

router.get('/geo/drivers/:email',ensureAuthenticated,function(req,res,next){
  var currentEmail = req.params.email;
  var r = {};
  client.get("ridingRequest:"+req.user.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r);
    }
    else {
      reply = JSON.parse(reply);
      if (reply.driver_email==currentEmail) {
        //r.success=true;
        driverCurrentLocation.location(reply.driver_email,function(err,driverLocation){
          if (err) {
            r.success=false;
            r.msg= err;
            return res.send(r);
          }
          else {
            r.success=true;
            r.msg= "get driver location success";
            r.data=driverLocation;
            return res.send(r);
          }
        });
      }else {
        r.success=false;
        r.msg= "This driver is not the accepted driver";
        return res.send(r);
      }
    }
  })
})

router.get('/tripPrice',ensureAuthenticated,function(req,res,next){
  var startDay = req.query.startDay;
  var startTime=req.query.startTime;
  var totalTime = req.query.totalTime;
  var totalMile = req.query.totalMile;
  var per_KM_price_type = req.query.per_KM_price_type||"normal";
  var totalPrice;
  var currentPricePerMin;
  var r = {};
    db.getDayPrice(startDay,function(err,result){
      if (err) {
        r.success=false;
        r.msg= err;
        return res.send(r);
      }else {
        var prices = result.price,price;
        for(var p in prices){
          var time = p.split('-');
          var i = 0;
          if(parseInt(time[i])<=startTime&&startTime<parseInt(time[i+1])){
            price = prices[p];
            currentPricePerMin= price;
            break;
          }
            i++;
      }
        db.getPerKMPrice(per_KM_price_type,function(err,reply){
          if (err) {
            r.success=false;
            r.msg= err;
            return res.send(r);
          }
          else {
            console.log(currentPricePerMin, totalTime, totalMile);
            totalPrice = currentPricePerMin*totalTime+totalMile*(reply.normal_price);
              console.log(reply.normal_price);
            r.success=true;
            r.msg= "success";
            r.data= {"totalPrice":totalPrice.toFixed(2)};
            return res.send(r);
          }
        })
      }
    });
})



router.post('/ridingRecords',ensureAuthentication,function(req,res){

  req.checkBody("rider_email", "Enter a valid rider email.").isEmail();
  req.checkBody("driver_emial", "Enter a valid driver emial.").isEmail();
  req.checkBody("star_location", "Enter a valid star location.").notEmpty();
  req.checkBody("end_location", "Enter a valid end location.").notEmpty();
  req.checkBody("price", "Enter a valid price.").isFloat();
  req.checkBody("rating", "Enter a valid rating.").isInt();
  var errors = req.validationErrors();
  if (errors) {
    var re = {};
    re.success = false;
    re.error= errors;
    return res.send(re);
  } else {
  var r = {};
  //firstly get the start and end location from redis
  client.get("ridingRequest:"+req.params.email,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= err;
      return res.send(r);
    }
    else {
      var record = {
        rider_email:req.body.rider_email,
        driver_emial:req.body.driver_emial,
        star_location:reply.startLocation,
        end_location:reply.endLocation,
        price:req.body.price,
        rating:req.body.rating
      }
      db.PostRidingRecord(record,function(err,result){
        if (err) {
          r.success=false;
          r.msg= err;
          return res.send(r);
        }
        else {
          client.del("ridingRequest:"+req.params.email,function(err,reply){
            if (err) {
              r.success=false;
              r.msg= err;
              return res.send(r);
            }
            else {
              r.success=false;
              r.msg= "post record success, and delete this ridingRequest success";
              r.data= reply;
              return res.send(r);
            }
          })
        }
      });
    }
  });

}
})


//add ensureAuthentication,this is for testing
router.delete('/ridingRequest/:email',ensureAuthenticated,function(req,res,next){
    var r = {};
    client.del("ridingRequest:"+req.params.email,function(err,reply){
      if (err) {
        r.success=false;
        r.msg= err;
        return res.send(r);
      }
      else {
        r.success=true;
        r.msg= "delete this ridingRequest success";
        r.data= reply;
        return res.send(r);
      }
    })
})



router.post('/UnsuccessfulTripInformation',ensureAuthenticated,function(req,res,next){
  var r = {};
  var trip = {
    rider_email:req.body.rider_email,
    driver_emial:req.body.driver_emial,
    start_time:req.body.start_time,
    end_time:req.body.end_time,
    star_location : req.body.star_location,
    end_location : req.body.end_location,
    estimated_price:req.body.estimated_price,
    price:req.body.price,
    score:req.body.score
  };
  db.createUnsuccessfulTrip(trip,function(err,result){
    if (err) {
      r.success=false;
      r.msg = err;
      return res.send(r);
    }else {
      r.success = true;
      r.msg = "save this unsuccessful trip information";
      r.data = result;
      return res.send(r);
    }
  })
})



  router.post('/tripInformation',ensureAuthenticated,function(req, res){
    try {
      var callbackCheck = 0;
      var r = {};
      var trip = {
        rider_email:req.body.rider_email,
        driver_emial:req.body.driver_emial,
        start_time:req.body.start_time,
        end_time:req.body.end_time,
        star_location : req.body.star_location,
        end_location : req.body.end_location,
        estimated_price:req.body.estimated_price,
        price:req.body.price,
        score:req.body.score
      };
      db.createTrip(trip, function(err,result){
        callbackCheck++;
        if (err) {
          r.success=false;
          r.msg = err;
        }else {
          r.success=true;
          r.msg = "payement success";
          r.data = result
        }
        if(callbackCheck >= 4){
          res.send(r);
        }
      });

      var paymentRecod = {
        rider_email:req.body.rider_email,
        driver_emial:req.body.driver_email,
        price:req.body.price
      }
      db.paymentRecordCreate(paymentRecod, function(err,result){
        callbackCheck++;
        if (err) {
          r.success=false;
          r.msg = err;
        }else {
          r.success=true;
          r.msg = "payment success";
          r.data = result
        }
        if(callbackCheck >= 4){
          res.send(r);
        }
      });

      db.getEvaluationByEmail(req.body.driver_email, function(err,result){
        callbackCheck++;
        if (err) {
          r.success=false;
          r.msg = err;
        }else if (result==null) {
          var evaluation = {
            driver_emial:req.body.driver_email,
            score:[],
            driver_status:"NORMAL"
          }
          evaluation.score.push(req.body.score);
          db.createEvaluation(evaluation,function(err,result){
            if (err) {
              r.success = false;
              r.msg = err;
              return res.send(r);
            }else {
              r.success = true;
              r.msg = "The driver is first to be evaluated"
              return res.send(r);
            }
          })
        }
        else if(result!=null){
          result.score.push(req.body.score);
          if (result.driver_status=="NORMAL") {
            db.getEvaluationParams("NORMAL",function(err,params){
              if (err) {
                r.success=false;
                r.msg=err;
                return res.send(r);
              }else {
                //if length > standard
                if (result.score.length>params.normal_standard_length) {
                  result.score.shift();
                }
                result.score.push(req.body.score);
                var sum = 0;
                for (var i = 0; i < req.body.score.length; i++) {
                  sum+=req.body.score[i];
                }
                var average = sum/req.body.score.length;
                if (average<params.standard_average) {
                  result.score = [];
                  result.driver_status="WARN";
                }

                db.updateEvaluationByEmail(req.body.driver_email,result,function(err,re){
                  if (err) {
                    r.success=false;
                    r.msg = err;
                  }
                  else {
                    r.success = true;
                  }
                })
              }
            })
          }else if (result.driver_status=="WARN") {
            db.getEvaluationParams("WARN",function(err,params){
              if (err) {
                r.success=false;
                r.msg=err;
                return res.send(r);
              }else {
                //if length > standard
                if (result.score.length>=params.warn_limit_length) {
                  var sum = 0;
                  var average;
                  for (var i = 0; i < req.body.score.length; i++) {
                    sum+=array[i];
                  }
                  average = sum/req.body.score.length;
                  result.score = [];
                  if (average>params.warn_standard_average) {
                    result.driver_status="NORMAL";
                  }else {
                    result.driver_status = "PROHIBIT";
                  }
                }


                if (average<params.standard_average) {
                  result.score = [];
                  result.driver_status="WARN";
                }

                db.updateEvaluationByEmail(req.body.driver_email,result,function(err,re){
                  if (err) {
                    r.success=false;
                    r.msg = err;
                  }
                  else {
                    r.success = true;
                  }
                })

              }
            })
          }
        }
        if(callbackCheck >= 4){
          res.send(r);
        }
      });

      client.del("ridingRequest:"+req.body.rider_email,function(err,reply){
        callbackCheck++;
        if (err) {
          r.success=false;
          r.msg= err;
          return res.send(r);
        }
        else {
          r.success=true;
          r.msg= "delete this ridingRequest success and save trip and payment record success";
        }
        if(callbackCheck >= 4){
          res.send(r);
        }
    })
    } catch (e) {
      return res.send(e);
    }
  //   var callbackCheck = 0;
  //   var r = {};
  //   var trip = {
  //     rider_email:req.body.rider_email,
  //     driver_emial:req.body.driver_emial,
  //     start_time:req.body.start_time,
  //     end_time:req.body.end_time,
  //     star_location : req.body.star_location,
  //     end_location : req.body.end_location,
  //     estimated_price:req.body.estimated_price,
  //     price:req.body.price,
  //     score:req.body.score
  //   };
  //   db.createTrip(trip, function(err,result){
  //     callbackCheck++;
  //     if (err) {
  //       r.success=false;
  //       r.msg = err;
  //     }else {
  //       r.success=true;
  //       r.msg = "payement success";
  //       r.data = result
  //     }
  //     if(callbackCheck >= 4){
  //       res.send(r);
  //     }
  //   });
  //
  //   var paymentRecod = {
  //     rider_email:req.body.rider_email,
  //     driver_emial:req.body.driver_email,
  //     price:req.body.price
  //   }
  //   db.paymentRecordCreate(paymentRecod, function(err,result){
  //     callbackCheck++;
  //     if (err) {
  //       r.success=false;
  //       r.msg = err;
  //     }else {
  //       r.success=true;
  //       r.msg = "payment success";
  //       r.data = result
  //     }
  //     if(callbackCheck >= 4){
  //       res.send(r);
  //     }
  //   });
  //
  //   db.getEvaluationByEmail(req.body.driver_email, function(err,result){
  //     callbackCheck++;
  //     if (err) {
  //       r.success=false;
  //       r.msg = err;
  //     }else if (result==null) {
  //       var evaluation = {
  //         driver_emial:req.body.driver_email,
  //         score:[],
  //         driver_status:"NORMAL"
  //       }
  //       evaluation.score.push(req.body.score);
  //       db.createEvaluation(evaluation,function(err,result){
  //         if (err) {
  //           r.success = false;
  //           r.msg = err;
  //           return res.send(r);
  //         }else {
  //           r.success = true;
  //           r.msg = "The driver is first to be evaluated"
  //           return res.send(r);
  //         }
  //       })
  //     }
  //     else if(result!=null){
  //       result.score.push(req.body.score);
  //       if (result.driver_status=="NORMAL") {
  //         db.getEvaluationParams("NORMAL",function(err,params){
  //           if (err) {
  //             r.success=false;
  //             r.msg=err;
  //             return res.send(r);
  //           }else {
  //             //if length > standard
  //             if (result.score.length>params.normal_standard_length) {
  //               result.score.shift();
  //             }
  //             result.score.push(req.body.score);
  //             var sum = 0;
  //             for (var i = 0; i < req.body.score.length; i++) {
  //               sum+=req.body.score[i];
  //             }
  //             var average = sum/req.body.score.length;
  //             if (average<params.standard_average) {
  //               result.score = [];
  //               result.driver_status="WARN";
  //             }
  //
  //             db.updateEvaluationByEmail(req.body.driver_email,result,function(err,re){
  //               if (err) {
  //                 r.success=false;
  //                 r.msg = err;
  //               }
  //               else {
  //                 r.success = true;
  //               }
  //             })
  //           }
  //         })
  //       }else if (result.driver_status=="WARN") {
  //         db.getEvaluationParams("WARN",function(err,params){
  //           if (err) {
  //             r.success=false;
  //             r.msg=err;
  //             return res.send(r);
  //           }else {
  //             //if length > standard
  //             if (result.score.length>=params.warn_limit_length) {
  //               var sum = 0;
  //               var average;
  //               for (var i = 0; i < req.body.score.length; i++) {
  //                 sum+=array[i];
  //               }
  //               average = sum/req.body.score.length;
  //               result.score = [];
  //               if (average>params.warn_standard_average) {
  //                 result.driver_status="NORMAL";
  //               }else {
  //                 result.driver_status = "PROHIBIT";
  //               }
  //             }
  //
  //
  //             if (average<params.standard_average) {
  //               result.score = [];
  //               result.driver_status="WARN";
  //             }
  //
  //             db.updateEvaluationByEmail(req.body.driver_email,result,function(err,re){
  //               if (err) {
  //                 r.success=false;
  //                 r.msg = err;
  //               }
  //               else {
  //                 r.success = true;
  //               }
  //             })
  //
  //           }
  //         })
  //       }
  //     }
  //     if(callbackCheck >= 4){
  //       res.send(r);
  //     }
  //   });
  //
  //   client.del("ridingRequest:"+req.body.rider_email,function(err,reply){
  //     callbackCheck++;
  //     if (err) {
  //       r.success=false;
  //       r.msg= err;
  //       return res.send(r);
  //     }
  //     else {
  //       r.success=true;
  //       r.msg= "delete this ridingRequest success and save trip and payment record success";
  //     }
  //     if(callbackCheck >= 4){
  //       res.send(r);
  //     }
  // })

  })

  function ensureAuthenticated(req, res, next) {
    var r = {};
      if (req.isAuthenticated()) {
        return next(); }
      r.success=false;
      r.msg="authenticate rider failed";
      res.status(302).send(r);
    };

module.exports = router;
