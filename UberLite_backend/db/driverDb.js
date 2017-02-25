var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createDriver = function(db, objDriver, callback){
  db.collection('driver').findOne({email: objDriver.email}, function(err, thing){
    if(!thing){
      db.collection('driver').insertOne(objDriver, function(err, writeResult){
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

var findDriverByEmail = function(db, email, callback){
  db.collection('driver').findOne({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}



var findOneDriver1= function(db,obj,callback){
  db.collection('driver').findOne(obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.driverFindOne = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findOneDriver1(db,obj,callback);
    }
  });
}


var findDrivers= function(db,obj,callback){
  db.collection('driver').find(obj).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var findDriverById = function(db, id, callback){
  db.collection('driver').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}
module.exports.driverFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findDriverById(db,id,callback);
    }
  });
}


var updateDriver = function(db, email, obj, callback){
  db.collection('driver').update({email: email}, {$set: obj}, function(err, result){
    db.close();
    if(result.result.ok !== 1){
      callback(err, null);
    }
    else{
      callback(null, result);
    }
  });
}

module.exports.driverUpdate = function(email, obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateDriver(db, email, obj, callback);
    }
  });
};

module.exports.driversFind = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findDrivers(db,obj,callback);
    }
  });
}

module.exports.driverCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createDriver(db,obj,function(err, result){
        db.close();
        if(err){
          callback(err, null);
        }
        else {
          callback(null, result);
        }
      });
    }
  });
}


//deleteDriverByEmailInTemp

var deleteDriverByEmailInTemp = function(db, email, callback){
  db.collection('temporary_drivers').findOneAndDelete({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.TempDriverDeleteByEmail = function(email,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      deleteDriverByEmailInTemp(db,email,callback);
    }
  });
}

module.exports.driverFindByEmail = function(email, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findDriverByEmail(db,email,callback);
    }
  });
}
