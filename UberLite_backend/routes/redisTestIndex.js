var redis = require('redis');
var express = require('express');
var router = express.Router();
 // Add your cache name and access key.
var client = redis.createClient(6380,'UberLite.redis.cache.windows.net', {auth_pass: '2zdj/rRAD8Uo/9zrSK5BUl9asvLtyU4ZRyIYmlFekb8=', tls: {servername: 'UberLite.redis.cache.windows.net'}});

var geo = require('georedis')
// .initialize(client,{
//   zset:'mySpecialLocationsSet',
//   nativeGeo:false
// });


//geo is the whole set to hold the data
//rider and driver are the subset
var riderStartLocation = geo.addSet('riderStartLocation');
var driverCurrentLocation = geo.addSet('driverCurrentLocation');

// do not delete those set below
var riderLocations = {
  '1111': {latitude: 43.6667, longitude: -79.4167},
  '2222': {latitude: 39.9523, longitude: -75.1638},
  '3333': {latitude: 37.4688, longitude: -122.1411},
  '4444': {latitude: 37.7691, longitude: -122.4449}
};

var driverLocations  = {
  '5555': {latitude: 43.6667, longitude: -79.4167},
  '6666': {latitude: 39.9523, longitude: -75.1638},
  '7777': {latitude: 37.4688, longitude: -122.1411},
  '8888': {latitude: 37.7691, longitude: -122.4449},
  '9999': {latitude: 47.5500, longitude: -52.6667}
};

//options
var options = {
  withCoordinates: true, // Will provide coordinates with locations, default false
  withHashes: true, // Will provide a 52bit Geohash Integer, default false
  withDistances: true, // Will provide distance from query, default false
  order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
  units: 'km', // or 'km', 'mi', 'ft', default 'm'
  count: 100, // Number of results to return, default undefined
  accurate: true // Useful if in emulated mode and accuracy is important, default false
};

// //add above two set to rider and deriver set
// riderStartLocation.addLocations(riderLocations,function(err,reply){
//   if (err) {
//     console.error(err);
//   }else {
//     console.log('add rider:',reply);
//   }
// });
//
// driverCurrentLocation.addLocations(driverLocations,function(err,reply){
//   if (err) {
//     console.error(err);
//   }else {
//     console.log('add driver:',reply);
//   }
// });


function ensureAuthenticated(req, res, next) {
    var r = {};
      if (req.isAuthenticated()) {
          console.log("11111111");
        return next(); }
      r.success=false;
      r.msg="authenticate user failed";
      res.status(302).send(r);
  };


// router.post('/ridingRequest/:email',function(req,res,next){
//   var key = req.params.email;
//   var startLongitude = req.body.startlongitude;
//   var startLatitude = req.body.startlatitude;
//   var endLongitude = req.body.endlongitude;
//   var endLatitude = req.body.endlatitude;
//
//   var r = {};
//   riderRequest.get(key,function(err,reply){
//     if (err) {
//       r.
//     }
//   })
// })

//send position of a rider
router.post('/rider/location/:email',ensureAuthenticated,function(req,res,next){
  var key = req.params.email;
  var currentLongitude = req.body.longitude;
  var currentLatitude = req.body.latitude;
  var r ={};
  console.log(key);
  riderStartLocation.addLocation(key,{longitude:currentLongitude,latitude:currentLatitude},function(err,reply){
    if (err) {
      r.success=false;
      r.msg = "rider send current position failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg= "rider send current position success";
      r.data= reply;
      res.send(r);
    }
  });
});


router.get('/derversLocations',ensureAuthenticated,function(req,res,next){
  console.log(req.session);
  var r = {};
  driverCurrentLocation.location("5555",function(err,reply){
    if (err) {
      r.success=false;
      r.msg = "get drivers location failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg= "get drivers location success";
      r.data= reply;
      res.send(r);
    }
  })
})

//send location of a driver
router.post('/driver/location/:email',function(req,res,next){
  var key = req.params.email;
  var currentLongitude = req.body.longitude;
  var currentLatitude = req.body.latitude;
  var r ={};
  console.log(key);
  driverCurrentLocation.addLocation(key,{longitude:currentLongitude,latitude:currentLatitude},function(err,reply){
    if (err) {
      r.success=false;
      r.msg = "driver send current position failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg= "driver send current position success";
      r.data= reply;
      res.send(r);
    }
  });
});

//Look for Nearby Locations In driver Set
router.get('/nearbyDrivers/:email',function(req,res,next){
  var key = req.params.email;
  var r ={};
  geo.location(key,function(err,reply){
    if (err) {
      r.success=false;
      r.msg= "rider get location failed";
      res.send(r);
    }
    else {
      console.log(key);
      console.log(reply);
      var lo = reply.longitude;
      var la = reply.latitude;
      var radius = req.body.radius;
      driverCurrentLocation.radius({longitude:lo,latitude:la},radius,options,function(err,reply){
        var re ={};
        if (err) {
          re.success=false;
          re.msg = "rider search nearby driver failed";
          res.send(re);
        }
        else {
          resuccess=true;
          re.msg= "rider search nearby driver success";
          re.data= reply;
          res.send(re);
        }
      });
    }
  });
});


router.put('/location/:email',function(req,res,next){
  var key = req.body.email;
  var r = {};
  var lo = req.body.longitude;
  var la = req.body.latitude;
  geo.updateLocation(key,{longitude:lo,latitude:la},function(err,reply){
    if (err) {
      r.success=false;
      r.msg="updating location failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg="updating location success";
      r.data=reply;
      res.send(r);
    }
  });
});


router.delete('/location/:email',function(req,res,next){
  var key = req.body.email;
  var r = {};
  var lo = req.body.longitude;
  var la = req.body.latitude;
  geo.removeLocation(key,function(err,reply){
    if (err) {
      r.success=false;
      r.msg="delete location failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg="delete location success";
      r.data=reply;
      res.send(r);
    }
  });
});

//driverCurrentLocation
router.delete('/driverCurrentLocation',function(req,res,next){
  var r = {};
  geo.deleteSet(driverCurrentLocation,function(err,reply){
    if (err) {
      r.success=false;
      r.msg="delete driverCurrentLocation failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg="delete driverCurrentLocation success";
      r.data=reply;
      res.send(r);
    }
  })
});

router.delete('/riderStartLocation',function(req,res,next){
  var r = {};
  geo.deleteSet('riderStartLocation',function(err,reply){
    if (err) {
      r.success=false;
      r.msg="clear riderStartLocation failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg="clear riderStartLocation success";
      r.data=reply;
      res.send(r);
    }
  })
});

//client
router.delete('/redis',function(req,res,next){
  var r = {};
  client.FLUSHDB(function(err,reply){
    if (err) {
      r.success=false;
      r.msg="clear redis failed";
      res.send(r);
    }
    else {
      r.success=true;
      r.msg="clear redis success";
      r.data=reply;
      res.send(r);
    }
  })
});

module.exports = router;
