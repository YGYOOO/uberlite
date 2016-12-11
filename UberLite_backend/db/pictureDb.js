var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createDriver = function(db, objDriver, callback){
  db.collection('fs.files').findOne({email: objDriver.email}, function(err, thing){
    if(!thing){
      db.collection('fs.files').insertOne(objDriver, function(err, writeResult){
        if(writeResult.result.ok !== 1){
          callback(err, null);
        }
        else{
          callback(null, writeResult);
        }
      });
    }
    else {
      callback(null, null);
    }
  });
}

var findPictureByEmail = function(db, email, callback){
  db.collection('fs.files').findOne({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var deletePicturesExceptDefualt = function(db,callback){
  db.collection('fs.files').remove({"type":{$ne:"defaultImage"}}, function(err,thing){
    db.close();
    if (thing) {
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

exports.deleteAllExceptDefualt = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      deletePicturesExceptDefualt(db,callback);
    }
      });
}



var findOnePicture= function(db,obj,callback){
  db.collection('fs.files').findOne(obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.pictureFindOne = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findOnePicture(db,obj,callback);
    }
  });
}


var findPictures= function(db,obj,callback){
  db.collection('fs.files').find(obj).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var findPictureById = function(db, id, callback){
  console.log("111111");
  db.collection('fs.files').findOne({_id: mongodb.ObjectId(id)}, function(err,thing){
      console.log("2222222");
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var updatePicture = function(db, id, obj, callback){
  db.collection('fs.files').update({_id: mongodb.ObjectId(id)}, {$set: obj}, function(err, result){
    db.close();
    if(result.result.ok !== 1){
      callback(err, null);
    }
    else{
      callback(null, result);
    }
  });
}

module.exports.pictureUpdate = function(id, obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updatePicture(db, id, obj, callback);
    }
  });
};

module.exports.picturesFind = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findPictures(db,obj,callback);
    }
  });
}

// module.exports.driverCreate = function(obj,callback){
//   mongodb.connect(url, function(err, db){
//     if (err) {
//       console.log('Unable to connect to the mongoDB server. Error:', err);
//       callback(err, null);
//     }
//     else{
//       createDriver(db,obj,function(err, result){
//         db.close();
//         if(err){
//           callback(err, null);
//         }
//         else {
//           callback(null, result);
//         }
//       });
//     }
//   });
// }

module.exports.pictureFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findPictureById(db,id,callback);
    }
  });
}

module.exports.pictureFindByEmail = function(email, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findPictureByEmail(db,email,callback);
    }
  });
}
