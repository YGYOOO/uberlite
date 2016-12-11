var express = require('express');
//var assert = require('assert');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var routes = require('./routes/index');
var adminRoutes = require('./routes/adminIndex');
var indexRoutes = require('./routes/index');
var driverRoutes = require('./routes/driverIndex');
var riderRouters = require('./routes/riderIndex');
var redisRequestTestRoutes = require('./routes/redisRequestTestIndex');
var redisTestRoutes = require('./routes/redisTestIndex');
var authenticationForRider = require('./routes/authenticationForRider');
var authenticationForDriver = require('./routes/authenticationForDriver');
var authenticationForAdmin = require('./routes/authenticationForAdmin');
var passportTestRoutes = require('./routes/passportTestIndex');
var fileRoutes = require('./routes/saveFile');
var session = require('express-session');
var app = express();
//1231
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
// app.use('/',routes);
app.use('/',authenticationForRider);
app.use('/',authenticationForDriver);
app.use('/',authenticationForAdmin);
app.use('/',redisTestRoutes);
app.use('/',adminRoutes);
app.use('/',indexRoutes);
app.use('/',driverRoutes);//riderRouters
app.use('/',riderRouters);
app.use('/',fileRoutes);
app.use('/',redisRequestTestRoutes);
app.use('/',passportTestRoutes);

app.get('/',function(req,res){
  res.render('index')
});

app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  res.status(400);
  res.send( { msg : 'Invalid path.' } );
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
   app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send( { msg : err.message } );
   });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.send( { msg: err.message } );
  } );


module.exports = app;
