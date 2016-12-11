var redis = require('redis');
var express = require('express');
var router = express.Router();
 // Add your cache name and access key.
var client = redis.createClient(6380,'UberLite.redis.cache.windows.net', {auth_pass: '2zdj/rRAD8Uo/9zrSK5BUl9asvLtyU4ZRyIYmlFekb8=', tls: {servername: 'UberLite.redis.cache.windows.net'}});



function ensureAuthenticated(req, res, next) {
    var r = {};
      if (req.isAuthenticated()) {
          console.log("11111111");
        return next(); }
      r.success=false;
      r.msg="authenticate user failed";
      res.status(302).send(r);
  };


module.exports = router;
