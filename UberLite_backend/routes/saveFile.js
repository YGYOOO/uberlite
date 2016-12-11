var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty')
var db = require('../db/DB.js');
var bodyParser = require("body-parser");
var multer = require('multer');
var nodemailer = require('nodemailer');
var User = require('../userModel/driverModel'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),

    nev = require('email-verification')(mongoose);
mongoose.createConnection('mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite');
var fs = require('fs');
//hash password
// var passwordHash = require('password-hash');
//var hashedPassword = passwordHash.generate('password123');

var multer = require("multer");
var upload = multer({dest: "../public/uploads"});
var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  router.get("/", function(req,res){
  });
});

//router.use(multipart());
  //second parameter is multer middleware.
  router.post('/upload', upload.fields([{name:'headshot',maxCount:1},{name:'carshot',maxCount:1},{name:'licenseshot',maxCount:1}]), function(req, res, next){
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    console.log('--------------');
    console.log('@@@@@@@@@@@')
      console.log(req.files['headshot']);
        console.log('@@@@@@@@@@@');
        console.log('@@@@@@@@@@@');
        console.log(req.files['headshot'][0]);
          console.log(req.files['headshot'][0]._id);
            console.log('@@@@@@@@@@@');

    var head_writestream = gfs.createWriteStream({
      filename: req.files['headshot'][0].originalname
    });

    var car_writestream = gfs.createWriteStream({
      filename: req.files['carshot'][0].originalname
    });
        console.log('mmmmmmmmmm');
    var licenseshot_writestream = gfs.createWriteStream({
      filename: req.files['licenseshot'][0].originalname
    });
    //
  console.log('mmmmmmmmmm');
      console.log('11111111');
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("../public/uploads/" + req.files['headshot'][0].filename)
      .on("end", function(){fs.unlink("../public/uploads/"+ req.files['headshot'][0].filename, function(err){res.send("success")})})
        .on("err", function(){res.send("Error uploading image")})
          .pipe(head_writestream);
  console.log('2222222');
          fs.createReadStream("../public/uploads/" + req.files['carshot'][0].filename)
            .on("end", function(){fs.unlink("../public/uploads/"+ req.files['carshot'][0].filename, function(err){res.send("success")})})
              .on("err", function(){res.send("Error uploading image")})
                .pipe(car_writestream);
  console.log('333333');
                fs.createReadStream("../public/uploads/" + req.files['licenseshot'][0].filename)
                  .on("end", function(){fs.unlink("../public/uploads/"+ req.files['licenseshot'][0].filename, function(err){res.send("success")})})
                    .on("err", function(){res.send("Error uploading image")})
                      .pipe(licenseshot_writestream);

  });

  // sends the image we saved by filename.
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

  //delete the image
  router.get('/delete/:filename', function(req, res){
    gfs.exist({filename: req.params.filename}, function(err, found){
      if(err) return res.send("Error occured");
      if(found){
        gfs.remove({filename: req.params.filename}, function(err){
          if(err) return res.send("Error occured");
          res.send("Image deleted!");
        });
      } else{
        res.send("No image found with that title");
      }
    });

});


module.exports = router;
