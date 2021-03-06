var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg');

var redis = require('redis');
var client = redis.createClient(6380, 'UberLite.redis.cache.windows.net', {
  auth_pass: '2zdj/rRAD8Uo/9zrSK5BUl9asvLtyU4ZRyIYmlFekb8=',
  tls: {
    servername: 'UberLite.redis.cache.windows.net'
  }
});
// Add your cache name and access key.
var geo = require('georedis');

var riderStartLocation = geo.addSet('riderStartLocation');
var driverCurrentLocation = geo.addSet('driverCurrentLocation');
var db = require('../db/DB.js');
var check = require('syntax-error');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var sendWarningEmail = require('./sendWarningEmail.js');
var sendProhibitEmail = require('./sendProhibitEmail.js');
var sendReceiptEmail = require('./sendReceiptEmail.js');
var fs = require("fs");
var User = require('../userModel/riderModel'),
  mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  nev = require('email-verification')(mongoose);


//hash password
var passwordHash = require('password-hash');

var ensureAuthentication = require('./authenticationForRider');

var multer = require("multer");
var upload = multer({
  dest: "../public/uploads"
});


var gfs;

var Grid = require("gridfs-stream");
var conn = mongoose.connection;

//params validator
var bodyParser = require('body-parser');
var validator = require('express-validator');
router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(validator());


//declare const
const WATING = "WATING";

Grid.mongo = mongoose.mongo;

conn.once("open", function() {
  gfs = Grid(conn.db);
  router.get("/", function(req, res) {});
});

nev.configure({
  persistentUserModel: User,
  expirationTime: 600000, // 10 minutes
  tempUserModel: null,
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
router.post('/riders/:email/shot', upload.single('riderShot'), function(req, res, next) {
  // req.file is the `dirvershot` file
  // req.body will hold the text fields, if there were any
  try {
    req.checkParams("email", "Enter a valid email").notEmpty()
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      var head_writestream = gfs.createWriteStream({
        filename: req.file.originalname,
        //filename: email+"_headshot"
      });
      head_writestream.on('close', function(file) {
        // do something with `file`
        db.updatePicture(file._id, {
          email: req.params.email,
          type: 'riderShot'
        }, function(err, result) {
          if (err) {
            r.success = false;
            r.msg = err;
            res.send(r);
          } else {
            r.success = true;
            res.send(r);
          }
        });
      });
      fs.createReadStream("../public/uploads/" + req.file.filename)
        .on("end", function() {
          fs.unlink("../public/uploads/" + req.file.filename, function(err) {})
        })
        .on("err", function() {
          res.send("Error uploading image")
        })
        .pipe(head_writestream);
    }
  } catch (e) {
    res.send(e);
  }
});


//
router.post('/riders/:email/registrationInfo', function(req, res) {

  try {
    req.checkParams("email", "Enter a valid email address.").notEmpty();
    // req.checkBody("email", "Enter a valid email address.").notEmpty();
    req.checkBody("password", "Enter a valid password.").notEmpty();
    req.checkBody("full_name", "Enter a valid name.").notEmpty();
    req.checkBody("creditCard_number", "Enter a valid creditCard number.").notEmpty();
    req.checkBody("creditCard_name", "Enter a valid creditCard name.").notEmpty();
    req.checkBody("creditCard_expire", "Enter a valid creditCard expire.").notEmpty();
    req.checkBody("age", "Enter a valid age.").notEmpty();
    req.checkBody("phoneNumber", "Enter a valid phone number").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      // normal processing here
      db.findPictures({
        email: req.params.email
      }, function(err, p) {
        var r = {};
        if (err) {
          r.success = false;
          r.msg = err;
          res.send(r);
        } else {
          var p_id;
          if (p.type == 'riderShot') {
            p_id = p._id;
          }
        }
        var email = req.params.email;
        var password = req.body.password;
        var full_name = req.body.full_name;
        var creditCard_number = req.body.creditCard_number;
        var creditCard_name = req.body.creditCard_name;
        var creditCard_expire = req.body.creditCard_expire;
        var age = req.body.age;
        var phone_number = req.body.phone_number;
        var hashedPassword = passwordHash.generate(password);
        var newUser = new User({
          email: email,
          password: hashedPassword,
          full_name: full_name,
          age: age,
          phone_number: phone_number,
          creditCard_number: creditCard_number,
          creditCard_name: creditCard_name,
          creditCard_expire: creditCard_expire,
          rider_picture: p[0]._id
        });
        nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
          if (err) return res.status(404).send('ERROR: creating temp user FAILED');
          var r = {};
          r.success = true;
          if (existingPersistentUser) {
            r.msg = 'You have already signed up and confirmed your account. Did you forget your password?';
            return res.send(r);
          } else if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(email, URL, function(err, info) {
              var removeEmail = email;
              if (err) {
                console.log(err);
                r.success = false;
                r.msg = 'Sending email failed.';
                db.deleteRiderInTemp(email, function(err, result) {
                  if (err) {
                    r.msg = 'delete rider in temp failed';
                  } else {
                    r.msg = 'delete success';
                  }
                })
                return res.send(r);
              }
              r.msg = 'An email has been sent to you. Please check it to verify your account.';
              res.send(r);
            });
          } else {
            r.msg = 'You have already signed up. Please check your email to verify your account.';
            res.send(r);
          }
        });
      });
    }
  } catch (e) {
    res.send(e);
  }
});



router.post('/riderRegisterResend', function(req, res) {
  try {
    req.checkBody("email", "Enter a valid email").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
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
    }
  } catch (e) {
    res.send(e);
  }
});

// user accesses the link that is sent
router.get('/rider-email-verification/:URL', function(req, res) {
  try {
    req.checkParams("URL", "Enter a valid URL").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
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
    }
  } catch (e) {
    res.send(e);
  }
});

//system function to delete all picture except the defualt
router.get('/deleteAllExceptDefualt', function(req, res, next) {
  var r = {};
  db.deletePicturesExceptD(function(err, thing) {
    if (err) {
      r.msg = "Delete pictues failed";
      r.success = false;
    } else {
      r.msg = "Delete pictues success";
      r.success = true;
    }
  });
});



function ensureAuthenticated(req, res, next) {
  var r = {};
  if (req.isAuthenticated()) {
    return next();
  }
  r.success = false;
  r.msg = "authenticate user failed";
  res.status(302).send(r);
};


router.post('/ridingRequests/:email', ensureAuthenticated, function(req, res) {
  try {
    req.checkParams("email", "Enter a valid email").notEmpty();
    req.checkBody("startLocation", "Enter a valid startLocation.").notEmpty();
    req.checkBody("endLocation", "Enter a valid endLocation.").notEmpty();
    req.checkBody("car_type", "Enter a valid car type.").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var key = req.params.email;
      var r = {};
      var ridingRequestInfo = {
        startLocation: req.body.startLocation,
        endLocation: req.body.endLocation,
        car_type: req.body.car_type,
        status: WATING,
        gcm_token: req.body.gcm_token
      };
      client.get("ridingRequest:" + req.params.email, function(err, reply) {
        reply = JSON.parse(reply);
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r)
        } else if (!reply || reply.status == 'WATING') {
          riderStartLocation.addLocation(key, ridingRequestInfo.startLocation, function(err, reply) {
            if (err) {
              r.success = false;
              r.msg = "rider send start location failed";
              return res.send(r);
            } else {
              db.findOneRider({
                email: req.params.email
              }, function(err, user) {
                if (err) {
                  r.success = false;
                  r.msg = err;
                  return res.send(r)
                } else {
                  ridingRequestInfo.full_name = user.full_name;
                  ridingRequestInfo.phone = user.phone;
                  ridingRequestInfo.status = WATING;
                  ridingRequestInfo.driver_email = null;
                  client.set("ridingRequest:" + req.params.email, JSON.stringify(ridingRequestInfo), function(err, reply) {
                    if (err) {
                      r.success = false;
                      r.msg = err;
                      return res.send(r)
                    } else {
                      r.success = true;
                      r.msg = "rider send request successfully";
                      r.data = reply;
                      return res.send(r);
                    }
                  });
                }
              });
              // return res.send(r);
            }
          });
        } else {
          r.success = false;
          r.msg = "you has send a request before";
          return res.send(r)
        }
      });

    } //valid
  } catch (e) {
    res.send(e);
  }
});


router.get('/Request/:email', ensureAuthenticated, function(req, res) {
  try {
    req.checkParams("email", "Enter a valid email").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      client.get("ridingRequest:" + req.params.email, function(err, reply) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          r.success = true;
          r.msg = "get success";
          r.date = reply;
          return res.send(r);
        }
      });
    }
  } catch (e) {
    res.send(e);
  }
});

router.delete('/request/:email', ensureAuthenticated, function(req, res) {
  try {
    req.checkParams("email", "Enter a valid email").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      client.del("ridingRequest:" + req.body.email, function(err, reply) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          r.success = true;
          r.msg = "cancel request success";
          r.date = reply;
          return res.send(r);
        }
      });
    }
  } catch (e) {
    res.send(e);
  }
});

router.get('/geo/drivers/:email', ensureAuthenticated, function(req, res, next) {
  try {
    req.checkParams("email", "Enter a valid email").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var currentEmail = req.params.email;
      var r = {};
      client.get("ridingRequest:" + req.user.email, function(err, reply) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          reply = JSON.parse(reply);
          if (reply.driver_email == currentEmail) {
            //r.success=true;
            driverCurrentLocation.location(reply.driver_email, function(err, driverLocation) {
              if (err) {
                r.success = false;
                r.msg = err;
                return res.send(r);
              } else {
                r.success = true;
                r.msg = "get driver location success";
                r.data = driverLocation;
                return res.send(r);
              }
            });
          } else {
            r.success = false;
            r.msg = "This driver is not the accepted driver";
            return res.send(r);
          }
        }
      })
    }
  } catch (e) {
    res.send(e);
  }
})

router.get('/tripPrice', ensureAuthenticated, function(req, res, next) {
  try {
    req.checkQuery("startDay", "Enter a valid start Day").notEmpty();
    req.checkQuery("startTime", "Enter a valid start Time").notEmpty();
    req.checkQuery("totalTime", "Enter a valid total Time").notEmpty();
    req.checkQuery("totalMile", "Enter a valid total Mile").notEmpty();
    req.checkQuery("car_type", "Enter a valid car type").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var startDay = req.query.startDay;
      var startTime = req.query.startTime;
      var totalTime = req.query.totalTime;
      var totalMile = req.query.totalMile;
      var car_type = req.query.car_type;
      var per_KM_price_type = car_type;
      var totalPrice;
      var currentPricePerMin;
      var r = {};
      db.getDayPrice(startDay, function(err, result) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          var prices = result.price,
            price;
          for (var p in prices) {
            var time = p.split('-');
            var i = 0;
            if (parseInt(time[i]) <= startTime && startTime < parseInt(time[i + 1])) {
              price = prices[p];
              currentPricePerMin = price;
              break;
            }
            i++;
          }
          db.getPerKMPrice(per_KM_price_type, function(err, reply) {
            if (err) {
              r.success = false;
              r.msg = err;
              return res.send(r);
            } else {
              totalPrice = currentPricePerMin * totalTime + totalMile * (reply.price);
              r.success = true;
              r.msg = "success";
              r.data = {
                "totalPrice": totalPrice.toFixed(2)
              };
              return res.send(r);
            }
          })
        }
      });
    }
  } catch (e) {
    res.send(e);
  }
})



router.post('/ridingRecords', ensureAuthentication, function(req, res) {
  try {
    req.checkBody("rider_email", "Enter a valid rider email.").isEmail();
    req.checkBody("driver_email", "Enter a valid driver emial.").isEmail();
    req.checkBody("star_location", "Enter a valid star location.").notEmpty();
    req.checkBody("end_location", "Enter a valid end location.").notEmpty();
    req.checkBody("price", "Enter a valid price.").isFloat();
    req.checkBody("rating", "Enter a valid rating.").isInt();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      //firstly get the start and end location from redis
      client.get("ridingRequest:" + req.params.email, function(err, reply) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          var record = {
            rider_email: req.body.rider_email,
            driver_email: req.body.driver_email,
            star_location: reply.startLocation,
            end_location: reply.endLocation,
            price: req.body.price,
            rating: req.body.rating
          }
          db.PostRidingRecord(record, function(err, result) {
            if (err) {
              r.success = false;
              r.msg = err;
              return res.send(r);
            } else {
              client.del("ridingRequest:" + req.params.email, function(err, reply) {
                if (err) {
                  r.success = false;
                  r.msg = err;
                  return res.send(r);
                } else {
                  r.success = false;
                  r.msg = "post record success, and delete this ridingRequest success";
                  r.data = reply;
                  return res.send(r);
                }
              })
            }
          });
        }
      });
    }
  } catch (e) {
    res.send(e);
  }
})

router.post('/failedTripInfo', ensureAuthenticated, function(req, res, next) {
  try {
    req.checkBody("rider_email", "Enter a valid rider email").notEmpty();
    req.checkBody("post_time", "Enter a valid post time").notEmpty();
    req.checkBody("star_location", "Enter a valid star location").notEmpty();
    req.checkBody("end_location", "Enter a valid end location").notEmpty();
    req.checkBody("estimated_price", "Enter a valid estimated price").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      var trip = {
        rider_email: req.body.rider_email,
        post_time: req.body.post_time,
        star_location: req.body.star_location,
        end_location: req.body.end_location,
        estimated_price: req.body.estimated_price
      };
      db.createUnsuccessfulTrip(trip, function(err, result) {
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          client.del("ridingRequest:" + req.body.rider_email, function(err, reply) {
            if (err) {
              r.success = false;
              r.msg = err;
              return res.send(r);
            } else {
              riderStartLocation.removeLocation(req.body.rider_email, function(err, result) {
                if (err) {
                  r.success = false;
                  r.msg = err;
                  return res.send(r);
                } else {
                  r.success = true;
                  r.msg = "delete this ridingRequest success and save this unsuccessful trip information";
                  r.data = reply;
                  return res.send(r);
                }
              })
            }
          })
        }
      })
    }
  } catch (e) {
    res.send(e);
  }
})

router.post('/tripInfo', ensureAuthenticated, function(req, res, next) {
  try {
    req.checkBody("rider_email", "Enter a valid rider email").notEmpty();
    req.checkBody("driver_email", "Enter a valid driver email").notEmpty();
    req.checkBody("post_time", "Enter a valid post time").notEmpty();
    req.checkBody("accepted_time", "Enter a valid accepted time").notEmpty();
    req.checkBody("pickup_time", "Enter a valid pickup time").notEmpty();
    req.checkBody("arrival_time", "Enter a valid arrival time").notEmpty();
    req.checkBody("star_location", "Enter a valid star location").notEmpty();
    req.checkBody("end_location", "Enter a valid end location").notEmpty();
    req.checkBody("estimated_price", "Enter a valid estimated price").notEmpty();
    req.checkBody("price", "Enter a valid price").notEmpty();
    req.checkBody("score", "Enter a valid score").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var callbackCheck = 0;
      var r = {};
      var trip = {
        rider_email: req.body.rider_email,
        driver_email: req.body.driver_email,
        post_time: req.body.post_time,
        accepted_time: req.body.accepted_time,
        pickup_time: req.body.pickup_time,
        arrival_time: req.body.arrival_time,
        star_location: req.body.star_location,
        end_location: req.body.end_location,
        estimated_price: req.body.estimated_price,
        price: req.body.price,
        score: req.body.score
      };
      db.createTrip(trip, function(err, result) {
        callbackCheck++;
        if (err) {
          r.success = false;
          r.msg = err;
        } else {
          r.success = true;
          r.msg = "payement success";
          r.data = result
          var re = {};
          // var startLocation = getStartAddress(trip);
          // var endLocation = getEndAddress(trip);
          sendReceiptEmail.sendReceiptEmail(req.body.rider_email, trip, function(err, email) {
            if (err) {
              re.success = false;
            } else {
              re.success = true;
            }
          })
        }
        if (callbackCheck >= 4) {
          return res.send(r);
        }
      });

      var paymentRecod = {
        rider_email: req.body.rider_email,
        driver_email: req.body.driver_email,
        price: req.body.price
      }
      db.paymentRecordCreate(paymentRecod, function(err, result) {
        callbackCheck++;
        if (err) {
          r.success = false;
          r.msg = err;
        } else {
          r.success = true;
          r.msg = "payment success";
          r.data = result
        }
        if (callbackCheck >= 4) {
          return res.send(r);
        }
      });

      db.findOneDriverByEmial(req.body.driver_email, function(err1, driver) {
        if (err1) {
          r.success = false;
          r.msg = err1;
        } else {
          db.getDriverEvaluationByEmail(req.body.driver_email, function(err, result) {
            callbackCheck++;
            if (err) {
              r.success = false;
              r.msg = err;
            } else if (result == null) {
              var evaluation = {
                driver_email: req.body.driver_email,
                score: [],
              }
              evaluation.score.push(req.body.score);
              db.createEvaluation(evaluation, function(err, result1) {
                if (err) {
                  r.success = false;
                  r.msg = err;
                  return res.send(r);
                } else {
                  r.success = true;
                  r.msg = "The driver is first to be evaluated"
                }
              })
            } else if (result != null) {
              result.score.push(req.body.score);
              if (driver.status == "NORMAL") {
                db.getEvaluationParams("NORMAL", function(err, params) {
                  if (err) {
                    r.success = false;
                    r.msg = err;
                    return res.send(r);
                  } else {
                    //if length > standard
                    if (result.score.length > params.normal_standard_length) {
                      result.score.shift();
                    }
                    result.score.push(req.body.score);
                    var sum = 0;
                    for (var i = 0; i < result.score.length; i++) {
                      sum += result.score[i];
                    }
                    var average = sum / result.score.length;
                    if (average < params.standard_average) {
                      result.score = [];
                      driver.status = "WARN";
                      var re = {};
                      //send driver a warnig email
                      sendWarningEmail.sendWarningEmail(req.body.driver_email, function(err, result) {
                        if (err) {
                          re.success = false;
                        } else {
                          re.success = true;
                        }
                      })
                    }
                    console.log("nor to warn average: " + average);
                    db.findOneDriverByEmial(req.body.driver_email, function(err, thing) {
                      if (err) {
                        r.success = false;
                        r.msg = err;

                      } else {
                        thing.status = driver.status;
                        thing.score = average;
                        db.updateDriverByEmail(req.body.driver_email, thing, function(err, th) {
                          if (err) {
                            r.success = false;
                            r.msg = err;

                          } else {
                            r.success = true;
                            r.msg = "update dirver table status success"
                            r.data = th;
                          }
                        })
                      }
                    })

                  }
                })
              } else if (driver.status == "WARN") {
                db.getEvaluationParams("WARN", function(err, params) {
                  if (err) {
                    r.success = false;
                    r.msg = err;
                    return res.send(r);
                  } else {
                    //if length > standard
                    if (result.score.length >= params.warn_limit_length) {
                      var sum = 0;
                      var average;
                      for (var i = 0; i < result.score.length; i++) {
                        sum += result.score[i];
                      }
                      average = sum / result.score.length;
                      result.score = [];
                      if (average > params.warn_standard_average) {
                        driver.status = "NORMAL";
                        db.findOneDriverByEmial(req.body.driver_email, function(err, thing) {
                          if (err) {
                            r.success = false;
                            r.msg = err;

                          } else {
                            thing.status = driver.status;
                            thing.score = average;
                            db.updateDriverByEmail(req.body.driver_email, thing, function(err, th) {
                              if (err) {
                                r.success = false;
                                r.msg = err;

                              } else {
                                r.success = true;
                                r.msg = "update dirver table status success"
                                r.data = th;
                              }
                            })
                          }
                        })
                      } else {
                        driver.status = "PROHIBIT";
                        sendProhibitEmail.sendProhibitEmail(req.body.driver_email, function(err, result) {
                          if (err) {
                            r.success = false;
                          } else {
                            r.success = true;

                          }
                        })
                      }

                      if (average < params.standard_average) {
                        result.score = [];
                        driver.status = "WARN";
                        var re = {};
                        //send driver a warnig email
                        sendWarningEmail.sendWarningEmail(req.body.driver_email, function(err, result) {
                          if (err) {
                            re.success = false;

                          } else {
                            re.success = true;
                          }
                        })
                      }

                      db.findOneDriverByEmial(req.body.driver_email, function(err, thing) {
                        if (err) {
                          r.success = false;
                          r.msg = err;

                        } else {
                          thing.status = driver.status;
                          thing.score = average;
                          db.updateDriverByEmail(req.body.driver_email, thing, function(err, th) {
                            if (err) {
                              r.success = false;
                              r.msg = err;
                              res.send(r);
                            } else {
                              r.success = true;
                              r.msg = "update dirver table status success"
                              r.data = th;
                            }
                          })
                        }
                      })

                    }


                  } //3 else
                })
              }
              db.updateEvaluationByEmail(req.body.driver_email, result, function(err, re) {
                if (err) {
                  r.success = false;
                  r.msg = err;

                } else {
                  r.success = true;
                }
              })

              db.findOneDriverByEmial(req.body.driver_email, function(err, thing) {
                if (err) {
                  r.success = false;
                  r.msg = err;
                } else {
                  thing.status = driver.status;
                  db.updateDriverByEmail(req.body.driver_email, thing, function(err, reply) {
                    if (err) {
                      r.success = false;
                      r.msg = err;
                    } else {
                      r.success = true;
                    }
                  })
                }
              })
            } //not null
            if (callbackCheck >= 4) {
              return res.send(r);
            }
          });
        }
      })

      // db.getDriverEvaluationByEmail(req.body.driver_email, function(err,result){
      //   callbackCheck++;
      //   if (err) {
      //     r.success=false;
      //     r.msg = err;
      //   }else if (result==null) {
      //     var evaluation = {
      //       driver_email:req.body.driver_email,
      //       score:[],
      //       driver_status:"NORMAL"
      //     }
      //     evaluation.score.push(req.body.score);
      //     db.createEvaluation(evaluation,function(err,result1){
      //       if (err) {
      //         r.success = false;
      //         r.msg = err;
      //         return res.send(r);
      //       }else {
      //         r.success = true;
      //         r.msg = "The driver is first to be evaluated"
      //       }
      //     })
      //   }
      //   else if(result!=null){
      //     result.score.push(req.body.score);
      //     if (result.driver_status=="NORMAL") {
      //       db.getEvaluationParams("NORMAL",function(err,params){
      //         if (err) {
      //           r.success=false;
      //           r.msg=err;
      //           return res.send(r);
      //         }else {
      //           //if length > standard
      //           if (result.score.length>params.normal_standard_length) {
      //             result.score.shift();
      //           }
      //           result.score.push(req.body.score);
      //           var sum = 0;
      //           for (var i = 0; i < result.score.length; i++) {
      //             sum+=result.score[i];
      //           }
      //           var average = sum/result.score.length;
      //           if (average<params.standard_average) {
      //             result.score = [];
      //             result.driver_status="WARN";
      //             var re ={};
      //             //send driver a warnig email
      //             sendWarningEmail.sendWarningEmail(req.body.driver_email,function(err,result){
      //               if (err) {
      //                 re.success=false;
      //               }else {
      //                 re.success = true;
      //               }
      //             })
      //           }
      //             console.log("nor to warn average: "+average);
      //           db.findOneDriverByEmial(req.body.driver_email,function(err,thing){
      //             if (err) {
      //               r.success=false;
      //               r.msg = err;
      //
      //             } else {
      //               thing.status = result.driver_status;
      //               thing.score = average;
      //               db.updateDriverByEmail(req.body.driver_email,thing,function(err,th){
      //                 if (err) {
      //                   r.success=false;
      //                   r.msg = err;
      //
      //                 } else {
      //                   r.success =true;
      //                   r.msg = "update dirver table status success"
      //                   r.data = th;
      //                 }
      //               })
      //             }
      //           })
      //
      //         }
      //       })
      //     }
      //     else if (result.driver_status=="WARN") {
      //       db.getEvaluationParams("WARN",function(err,params){
      //         if (err) {
      //           r.success=false;
      //           r.msg=err;
      //           return res.send(r);
      //         }
      //         else {
      //           //if length > standard
      //           if (result.score.length>=params.warn_limit_length) {
      //             var sum = 0;
      //             var average;
      //             for (var i = 0; i < result.score.length; i++) {
      //               sum+=result.score[i];
      //             }
      //             average = sum/result.score.length;
      //             result.score = [];
      //             if (average>params.warn_standard_average) {
      //               result.driver_status="NORMAL";
      //               db.findOneDriverByEmial(req.body.driver_email,function(err,thing){
      //                 if (err) {
      //                   r.success=false;
      //                   r.msg = err;
      //
      //                 } else {
      //                   thing.status = result.driver_status;
      //                   thing.score = average;
      //                   db.updateDriverByEmail(req.body.driver_email,thing,function(err,th){
      //                     if (err) {
      //                       r.success=false;
      //                       r.msg = err;
      //
      //                     } else {
      //                       r.success =true;
      //                       r.msg = "update dirver table status success"
      //                       r.data = th;
      //                     }
      //                   })
      //                 }
      //               })
      //             }else {
      //               result.driver_status = "PROHIBIT";
      //               sendProhibitEmail.sendProhibitEmail(req.body.driver_email,function(err,result){
      //                 if (err) {
      //                   r.success=false;
      //                 }else {
      //                   r.success = true;
      //
      //                 }
      //               })
      //             }
      //
      //             if (average<params.standard_average) {
      //               result.score = [];
      //               result.driver_status="WARN";
      //               var re ={};
      //               //send driver a warnig email
      //               sendWarningEmail.sendWarningEmail(req.body.driver_email,function(err,result){
      //                 if (err) {
      //                   re.success=false;
      //
      //                 }else {
      //                   re.success = true;
      //                 }
      //               })
      //             }
      //
      //             db.findOneDriverByEmial(req.body.driver_email,function(err,thing){
      //               if (err) {
      //                 r.success=false;
      //                 r.msg = err;
      //
      //               } else {
      //                 thing.status = result.driver_status;
      //                 thing.score = average;
      //                 db.updateDriverByEmail(req.body.driver_email,thing,function(err,th){
      //                   if (err) {
      //                     r.success=false;
      //                     r.msg = err;
      //                     res.send(r);
      //                   } else {
      //                     r.success =true;
      //                     r.msg = "update dirver table status success"
      //                     r.data = th;
      //                   }
      //                 })
      //               }
      //             })
      //
      //           }
      //
      //
      //         }//3 else
      //       })
      //     }
      //     db.updateEvaluationByEmail(req.body.driver_email,result,function(err,re){
      //       if (err) {
      //         r.success=false;
      //         r.msg = err;
      //
      //       }
      //       else {
      //         r.success = true;
      //       }
      //     })
      //
      //     db.findOneDriverByEmial(req.body.driver_email,function(err,thing){
      //       if (err) {
      //         r.success=false;
      //         r.msg = err;
      //       }
      //       else {
      //         thing.status = result.driver_status;
      //         db.updateDriverByEmail(req.body.driver_email,thing,function(err,reply){
      //           if (err) {
      //             r.success=false;
      //             r.msg = err;
      //           }
      //           else {
      //             r.success = true;
      //           }
      //         })
      //       }
      //     })
      //   }//not null
      //   if(callbackCheck >= 4){
      //     return res.send(r);
      //   }
      // });

      client.del("ridingRequest:" + req.body.rider_email, function(err, reply) {
        callbackCheck++;
        if (err) {
          r.success = false;
          r.msg = err;
          return res.send(r);
        } else {
          r.success = true;
          r.msg = "delete this ridingRequest success and save trip and payment record success";
        }
        if (callbackCheck >= 4) {
          return res.send(r);
        }
      })
    }
  } catch (e) {
    return res.send(e);
  }
})


function ensureAuthenticated(req, res, next) {
  var r = {};
  if (req.isAuthenticated()) {
    return next();
  }
  r.success = false;
  r.msg = "authenticate rider failed";
  res.status(302).send(r);
};

router.post('/statistics/ridingsAmount', ensureAuthenticated, function(req, res) {
  try {
    req.checkBody("name", "Enter a valid name").notEmpty();
    req.checkBody("geo", "Enter a valid geo").notEmpty();
    req.checkBody("riding", "Enter a valid riding").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error = errors;
      return res.send(re);
    } else {
      var r = {};
      var name = req.body.name;
      var geo = req.body.geo;
      db.getOneStatistics({
        name: name
      }, function(err, result) {
        if (err) {
          r.success = false;
          r.msg = err;
          res.send(r);
        } else { //new document
          if (result == null || result == "") {
            var obj = {
              name: name,
              geo: [],
              ridings: [],
            }
            obj.ridings.push(req.body.riding);
            obj.geo = req.body.geo;
            db.createStatistics(obj, function(err, thing) {
              var re = {};
              if (err) {
                re.success = false;
                re.msg = err;
                res.send(re);
              } else {
                re.success = true;
                re.msg = "create a new statistics"
                re.data = thing;
                res.send(re);
              }
            })
          } else {
            result.ridings.push(req.body.riding);
            db.updateStaticsByName(name, result, function(err, thing) {
              if (err) {
                r.success = false;
                r.msg = err;
                res.send(r);
              } else {
                r.success = true;
                r.msg = "update a statistics success"
                r.data = thing;
                res.send(r);
              }
            })
          }
        }
      })
    }
  } catch (e) {
    res.send(e);
  }
})


module.exports = router;