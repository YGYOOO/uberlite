var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createStatistics = function(db, obj, callback){
  db.collection('statistics').findOne(mongodb.ObjectID(obj.id), function(err, thing){
    if(!thing){
      db.collection('statistics').insertOne(obj, function(err, writeResult){
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

module.exports.statisticsCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createStatistics(db,obj,function(err, result){
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


var findOneStatistics= function(db,obj,callback){
  db.collection('statistics').findOne(obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.findOneStatistics = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findOneStatistics(db,obj,callback);
    }
  });
}




var findStatistics= function(db,obj,callback){
  db.collection('statistics').find(obj).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.statisticsFind = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findOneStatistics(db,obj,callback);
    }
  });
}


var updateStatics = function(db,name,obj,callback){
  db.collection('statistics').updateOne({name:name},obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.updateStaticsByName = function(name,obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateStatics(db,name,obj,callback);
    }
  });
}


var findAllStatics = function(db,callback){
  db.collection('statistics').find().toArray(function(err,results){
    db.close();
    if(results){
      callback(null,results);
    }
    else {
      callback(err,null);
    }
  });
}

module.exports.findAllStatistics = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findAllStatics(db,callback);
    }
  });
}




var deleteStatics = function(db,filter,callback){
  db.collection('statistics').findAndModify(filter,{$set:{ridings:[]}},function(err,results){
    db.close();
    if(results){
      callback(null,results);
    }
    else {
      callback(err,null);
    }
  });
}

module.exports.toDeleteStatistics = function(filter,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findAllStatics(db,callback);
    }
  });
}




var updateStaticsAll = function(db,id,callback){
  db.collection('statistics').update({_id:id},{$set:{ridings:[]}},function(err,results){
    db.close();
    if (err) {
      callback(err,null);
    } else {
      callback(null,results);
    }
  });
}

module.exports.toUpdateStatistics = function(id,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateStaticsAll(db,id,callback);
    }
  });
}


var updateStaticsRiding = function(db,id,ridings,callback){
  db.collection('statistics').update({_id:id},{$set:{ridings:ridings}},function(err,results){
    db.close();
    if (err) {
      callback(err,null);
    } else {
      callback(null,results);
    }
  });
}

module.exports.toUpdateStatisticsRiding = function(id,ridings,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateStaticsRiding(db,id,ridings,callback);
    }
  });
}



var updateRidingById = function(db,id,obj,callback){
  db.collection('statistics').updateOne({_id:id},obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.updateRidingByid = function(id,obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateRidingById(db,id,obj,callback);
    }
  });
}
