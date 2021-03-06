var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createTrip = function(db, objTrip, callback){
      db.collection('trip_information').insertOne(objTrip, function(err, writeResult){
        if(writeResult.result.ok !== 1){
          callback(err, null);
        }
        else{
          callback(null, writeResult);
        }
      });
}


module.exports.tripCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createTrip(db,obj,function(err, result){
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


var createUnsuccessfulTrip = function(db, objTrip, callback){
  db.collection('unsuccessful_trip_information').insertOne(objTrip, function(err, writeResult){
    if(writeResult.result.ok !== 1){
      callback(err, null);
    }
    else{
      callback(null, writeResult);
    }
  });
}


module.exports.untripCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createUnsuccessfulTrip(db,obj,function(err, result){
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




var getPriceByDay = function(db, day, callback){
  db.collection('trip_time_price').findOne({day:day}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}


module.exports.getPriceByD = function(day, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      getPriceByDay(db,day,callback);
    }
  });
}


var getPricePerKM = function(db, per_km_price_type, callback){
  db.collection('trip_per_km_price').findOne({per_KM_price_type:per_km_price_type}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}


module.exports.getPriceByKM = function(per_km_price_type, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      getPricePerKM(db,per_km_price_type,callback);
    }
  });
}

var findTripInfoById = function(db, id, callback){
  db.collection('trip_information').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}
module.exports.TripInfoFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findTripInfoById(db,id,callback);
    }
  });
}

var findAllTrip = function(db,callback){
  db.collection('trip_information').find().toArray(function(err,results){
    db.close();
    if(results){
      callback(null,results);
    }
    else {
      callback(err,null);
    }
  });
}

module.exports.findAllTripInfo = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findAllTrip(db,callback);
    }
  });
}



var findTripInfoById = function(db, id, callback){
  db.collection('trip_information').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}
module.exports.TripInfoFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findTripInfoById(db,id,callback);
    }
  });
}

var findAllCanceledTrip = function(db,callback){
  db.collection('unsuccessful_trip_information').find().toArray(function(err,results){
    db.close();
    if(results){
      callback(null,results);
    }
    else {
      callback(err,null);
    }
  });
}

module.exports.findAllCanceledTrip = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findAllCanceledTrip(db,callback);
    }
  });
}


var findCanceledTripInfoById = function(db, id, callback){
  db.collection('unsuccessful_trip_information').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}
module.exports.getCanceledTripInfoFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findCanceledTripInfoById(db,id,callback);
    }
  });
}
