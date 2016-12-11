var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

var findOneAdmin= function(db,obj,callback){
  db.collection('admin').findOne(obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.adminFindOne = function(obj,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method

      findOneAdmin(db,obj,callback);
    }
  });
}

var findAdminById = function(db, id, callback){
  db.collection('admin').findOne(mongodb.ObjectID(id), function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.adminFindById = function(id, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findDrivers method
      findAdminById(db,id,callback);
    }
  });
}



var findAdmins= function(db,callback){
  db.collection('admin').find({usertype:"admin"},function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.adminFindAll = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findAdmins(db,callback);
    }
  });
}
