var express = require('express');
var router = express.Router();
var db = require('../db/DB.js');
var bodyParser = require('body-parser');
var validator = require('express-validator');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(validator());


//all the picture getting from here
router.get('/picture/:id',ensureAuthenticated,function(req,res,next){
  var r = {};
  try {
    req.checkParams("id", "Enter a valid id.").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else {
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
    }
  } catch (e) {
    r.success=false;
    r.msg=e;
    res.send(r);
  }
});


router.get('/showPicture/:filename',ensureAuthenticated, function(req, res){
  var r = {};
  try {
    req.checkParams("filename","Enter a valid filename.").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else {
      var readstream = gfs.createReadStream({filename: req.params.filename});
      readstream.on("error", function(err){
        res.send("No image found with that title");
      });
      readstream.pipe(res);
    }
  } catch (e) {
    r.success = false;
    r.error= e;
    res.send(r);
  }
});


// router.use('/adminAPI', requireAuthentication);
function ensureAuthenticated(req, res, next) {
  var r = {};
    if (req.isAuthenticated()) {
      return next(); }
    r.success=false;
    r.msg="authenticate user failed";
    res.status(302).send(r);
  };


//to search drivers
router.get('/drivers',ensureAuthenticated, function(req, res, next) {
  try {
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
  } catch (e) {
    res.send(e);
  }
})

router.get('/driver/:id', ensureAuthenticated,function(req, res, next) {
  try {
    req.checkParams("id","Enter a valid id").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else {
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
    }
  } catch (e) {
    res.send(e);
  }
})

//to active driver
router.put('/activeDriver',ensureAuthenticated,function(req,res,next){
  try {
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
  } catch (e) {
    res.send(e);
  }
});

router.put('/driver/:id',ensureAuthenticated,function(req,res,next){
  try {
    req.checkParams("id","Enter a valid id").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else{
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
    }
  } catch (e) {
    res.send(e);
  }
});

//to search riders
router.get('/riders',ensureAuthenticated, function(req, res, next) {
  try {
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
  } catch (e) {
    res.send(e);
  }
})

router.get('/rider/:id',ensureAuthenticated, function(req, res, next) {
  try {
    req.checkParams("id","Enter a valid id").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else{
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
    }
  } catch (e) {
    res.send(e);
  }
})

//get driver's average
router.get('/drivers/:id/score',ensureAuthenticated,function(req,res,next){
  var r = {};
  try {
    db.toGetEvaluationById(req.params.id,function(err,result){
      if (err) {
        r.success = false;
        r.msg = err;
        res.send(r);
      } else {
        var sum = 0;
        var average;
        console.log(result);
        for (var i = 0; i < result.score.length; i++) {
          sum+=result.score[i];
        }
        average = sum/result.score.length;
        r.success =true;
        r.msg = "Get driver average success";
        r.data = average;
        res.send(r);
      }
    })
  } catch (e) {
    r.success = false;
    r.msg = e;
    res.send(r);
  }
})

router.get('/statistics/ridingsAmount',ensureAuthenticated,function(req,res,next){
  try {
    req.checkQuery("start","Enter a valid start").notEmpty();
    req.checkQuery("end","Enter a valid end").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else{
      var r = {};
      var start = req.query.start;
      var end = req.query.end;
      db.getAllStatistics(function(err,result){
        if (err) {
          r.success =false;
          r.msg = err;
          res.send(r);
        } else {
          let data = result.map(function(c){
            let city = {
              name:c.name,
              geo:c.geo,
              value:0
            };
            let filteredRidings = c.ridings.filter(function(riding){
              return riding < end && riding > start;
            });
            city.value = filteredRidings.length;
            return city;
          });
          r.success = true;
          r.msg = "Show the city result"
          r.data = data;
          res.send(r);
        }
      })
    }
  } catch (e) {
    res.send(e);
  }
})



router.delete('/statistics/ridingsAmount',function(req,res,next){
  try {
    req.checkQuery("start","Enter a valid start").notEmpty();
    req.checkQuery("end","Enter a valid end").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else{
      var r = {};
      var start = req.query.start;
      var end = req.query.end;
      db.getAllStatistics(function(err,result){
        if (err) {
          r.success =false;
          r.msg = err;
          res.send(r);
        } else {
          result.ridings.forEach((riding)=>{
            for (var i = 0; i < riding.length; i++) {
              if (riding[i]>start&&riding[i]<end) {
                riding.splice(i, 1);
              }
            }
          })
          db.updateRidngById(result._id,result,function(err,thing){
            if (err) {
              r.success =false;
              r.msg = err;
              res.send(r);
            } else {
              r.success = true;
              r.msg = "update riding success";
              r.data = thing;
              res.send(r);
            }
          })
        }
      })
    }
  } catch (e) {
    res.send(e);
  }
})

//to update all ridings to []
router.put('/ridings',function(req,res,next){
  var r={};
  db.getAllStatistics(function(err,result){
    if (err) {
      r.success =false;
      r.msg = err;
      res.send(r);
    } else {
      result.forEach((re)=>{
        db.updateStatistics(re._id,function(err,thing){
          if (err) {
            r.success=false;
            r.msg = err;
            res.send(r);
          } else {
            r.success = true;
            r.msg = "update the cities result success"
          }
        })
      })
      r.success = true;
      r.msg = "update the cities result success"
      res.send(r);
    }
  })
})

router.put('/statistics/ridings',function(req,res,next){
  try {
    req.checkBody("max","Enter a valid start").notEmpty();
    req.checkBody("min","Enter a valid end").notEmpty();
    req.checkBody("riding","Enter a valid end").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      var re = {};
      re.success = false;
      re.error= errors;
      return res.send(re);
    } else{
      var r = {};
      var max = req.body.max;
      var min = req.body.min;
      var riding = req.body.riding;
      var city = req.body.city||null;
      if (city==null||city.length==0) {
              db.getAllStatistics(function(err,results){
                if (err) {
                  r.success =false;
                  r.msg = err;
                  res.send(r);
                } else {
                  results.forEach((result)=>{
                    var time = parseInt(Math.random()*(max-min+1)+min,10);
                    for (var i = 0; i < time; i++) {
                      result.ridings.push(riding);
                    }
                    db.updateRidngById(result._id,result,function(err,re){
                      if (err) {
                        r.success =false;
                        r.msg = err;
                        res.send(r);
                      } else {
                        r.success = true;
                        r.msg = "insert riding success"
                      }
                    })
                  })
                  res.send(r);
                }
              })
      }else
      {

          db.getAllStatistics(function(err,results){
            if (err) {
              r.success =false;
              r.msg = err;
              res.send(r);
            } else{
              results.forEach((result)=>{
                if (city.contains(result.name)) {
                  var time = parseInt(Math.random()*(max-min+1)+min,10);
                  for (var i = 0; i < time; i++) {
                    result.ridings.push(riding);
                  }
                  db.updateRidngById(result._id,result,function(err,re){
                    if (err) {
                      r.success =false;
                      r.msg = err;
                      res.send(r);
                    } else {
                      r.success = true;
                      r.msg = "insert riding success"
                    }
                  })
                }//
              })
            }
          })
          }
      }//if city de else
  } catch (e) {
    res.send(e);
  }
})



// router.delete('/statistics/ridingsAmount',ensureAuthenticated,function(req,res,next){
//   try {
//     req.checkQuery("max","Enter a valid max").notEmpty();
//     req.checkQuery("min","Enter a valid min").notEmpty();
//     req.checkQuery("riding","Enter a valid riding").notEmpty();
//     var errors = req.validationErrors();
//     if (errors) {
//       var re = {};
//       re.success = false;
//       re.error= errors;
//       return res.send(re);
//     } else{
//       var r = {};
//       var max = req.query.max;
//       var end = req.query.end;
//       db.getAllStatistics(function(err,result){
//         if (err) {
//           r.success =false;
//           r.msg = err;
//           res.send(r);
//         } else {
//           let data = result.map(function(c){
//             let city = {
//               id:c._id,
//               name:c.name,
//               geo:c.geo,
//               value:0
//             };
//             let filteredRidings = c.ridings.filter(function(riding){
//               return riding < end && riding > start;
//             });
//             city.value = filteredRidings.length;
//             return city;
//           });
//           data.forEach((da)=>{
//             db.updateStatistics(da.id,function(err,thing){
//               if (err) {
//                 r.success=false;
//                 r.msg = err;
//                 res.send(r);
//               } else {
//                 r.success = true;
//                 r.msg = "update the cities result success"
//                 r.data = da;
//               }
//             })
//           })
//           r.success = true;
//           r.msg = "update the cities result success"
//           res.send(r);
//         }
//       })
//     }
//   } catch (e) {
//     res.send(e);
//   }
// })


module.exports = router;
