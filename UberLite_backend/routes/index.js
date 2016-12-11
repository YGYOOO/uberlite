var express = require('express');
var router = express.Router();
var db = require('../db/DB.js');

router.get('/login', function(req, res, next){
  res.sendFile('login.html', {root:__dirname + '/../public/admin'})
});

router.use('/management/', requireAuthentication);

router.get('/management/driver', function(req, res, next){
  res.sendFile('driver.html', {root:__dirname + '/../public/admin'})
});

router.get('/management/rider', function(req, res, next){
  res.sendFile('rider.html', {root:__dirname + '/../public/admin'})
});

function requireAuthentication(req, res, next){
  if(req.session && req.session.user){
    db.findOneAdmin(req.session.user, function(err, result){
      if(!err && !(result === null) && result.password === req.session.user.password){
        next();
      }
      else{
        req.session.user = {};
        res.redirect('/login');
      }
    });
  }
  else{
    req.session.user = {};
    res.redirect('/login');
  }
}

router.get('/management/driverInfo', function(req, res, next){
  res.sendFile('driver_info.html', {root:__dirname + '/../public/admin'})
});

router.get('/management/riderInfo', function(req, res, next){
  res.sendFile('rider_info.html', {root:__dirname + '/../public/admin'})
});

// /* GET home page. */
// router.post('/login',function(req, res, next) {
//   var obj = {};
//   obj.userName = req.body.userName;
//   db.ToFindOneUser(obj, function(err, thing){
//     if(!(thing===null)&&thing.password === req.body.password) {
//       req.session.user = thing;
//       console.log('login success');
//       console.log(thing);
//       res.send(thing);
//     }
//     else{
//       console.log('login Failed');
//     }
//   });
// });
//
// var requireAuthentication = function(req, res, next){
//   console.log(req.session.user);
//   if(req.session && req.session.user){
//     db.ToFindOneUser(req.session.user.userName, function(err, result){
//       if(!err && !(result === null) && result.password === req.session.user.password){
//         req.session.user = result;
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
// router.use('/api', requireAuthentication);
// // router.use('/driverApi', requireAuthentication);
// // router.use('/riderApi', requireAuthentication);
// // router.use('/adminApi', requireAuthentication);
//
// //create a user
// // router.post('/api/createUser',function(req,res,next){
// //   db.userCreate(req.body.userName,req.body.password, function(err, result){
// //     if(result){
// //       db.ToFindOneUser(req.body.userName, function(err, result){
// //         res.send(result);
// //       });
// //     }
// //     else {
// //       res.send(false);
// //     }
// //   });
// // })
//
// //driver to register
// router.post('/api/dirverRegister',function(req,res,next){
//   req.body.active = false;
//   db.ToRegisterDriver(req.body, function(err, result){
//     //register success
//     if(!err){
//       if(result){
//         // db.ToFindDrivers(req.body.emai, function(err, result){
//         //   console.log(result);
//         //   res.send(result);
//         // });
//         res.send({success:true});
//       }
//       else {
//         res.send({success:false, msg:""});
//       }
//     }
//     else{
//       res.send({success:false, msg:err});
//     }
//   });
// })
//
//
// //to look for
// router.get('/api/drivers', function(req, res, next) {
//   console.log(req.query);
//   obj = {};
//   for(var key in req.query){
//     if(req.query[key]) obj[key] = req.query[key];
//   }
//   db.ToFindDrivers(obj, function(err, thing){
//     if(err) {
//       console.log(err);
//       res.send(err);
//     }
//     else{
//       console.log(thing);
//       res.send(thing);
//     }
//   });
// });
//
//
// router.put('/api/user/:userName/password',function(req,res,next){
//   db.updatePassword(req.params.userName,req.body.mPassword, function(err,success){
//     if(err){
//       res.send(err);
//     }
//     else if(success){
//       res.send("update success");
//     }
//     else{
//       res.send("update failed");
//     }
//   });
// });
// router.get('/api/test', function(req, res, next){
//   res.send("lalalalalalal");
// });
//
// router.get('/api/getReqs',function(req,res){
//   res.json([
//     {Uname:'cccc',location:'lacrosse'},
//     {Uname:'yyyy',location:'china'}
//   ]);
// });
//
module.exports = router;
