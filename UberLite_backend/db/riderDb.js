var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createRider = function(db, objRider, callback){
  db.collection('rider').findOne({email: objRider.email}, function(err, thing){
    if(!thing){
      db.collection('rider').insertOne(objRider, function(err, writeResult){
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

var findRiders= function(db,obj,callback){
  db.collection('rider').find(obj).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var findRiderById = function(db, id, callback){
  db.collection('rider').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

var updateRider = function(db, id, obj, callback){
  db.collection('rider').update({_id: mongodb.ObjectId(id)}, {$set: obj}, function(err, result){
    db.close();
    if(result.result.ok !== 1){
      callback(err, null);
    }
    else{
      callback(null, result);
    }
  });
}

module.exports.riderUpdate = function(id, obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateDriver(db, id, obj, callback);
    }
  });
};

module.exports.ridersFind = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findRiders(db,obj,callback);
    }
  });
}

module.exports.riderCreate = function(obj,callback){
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


var deleterRiderByEmailInTemp = function(db, email, callback){
  db.collection('temporary_riders').findOneAndDelete({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.TempRiderDeleteByEmail = function(email,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      deleterRiderByEmailInTemp(db,email,callback);
    }
  });
}


module.exports.riderFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findRiderById method
      findRiderById(db,id,callback);
    }
  });
}

var findRiderByEmail = function(db, email, callback){
  db.collection('rider').findOne({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}


module.exports.riderFindByEmail = function(email, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findRiderByEmail(db,email,callback);
    }
  });
}


var findOneRider= function(db,obj,callback){
  db.collection('rider').findOne(obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.riderFindOne = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findOneRider(db,obj,callback);
    }
  });
}
