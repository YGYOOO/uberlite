var mongodb = require('mongodb');
var bcrypt = require('bcryptjs');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createUser = function(db, userName, password, callback){
  user =
  {
    userName: userName,
    password: password,
  },
  db.collection('user').findOne({userName: userName}, function(err, thing){
    if(!thing){
      db.collection('user').insertOne(user, function(err, writeResult){
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

//check whether there is ther user in the mangodb
var findOneUser= function(db,userName,callback){
  db.collection('user').findOne({userName:userName},function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

//find one user by id
var findOneUserById= function(db,id,callback){
  db.collection('user').findOneById({id:id},function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

//find all users
var findUsers = function(db,callback){
  db.collection('user').find().toArray(function(err,results){
    db.close();
    if(results){
      callback(null,results);
    }
    else {
      callback(err,null);
    }
  });
}

//update user password
var updateUserPassword = function(db,u,modifiedPassword,callback){
  db.collection('user').update({userName:u},{$set: {password:modifiedPassword}},function(err,count){
    db.close();
    if(err){
      callback(err, null);
    }
    else if(JSON.parse(count).ok == 1){
      callback(null, true);
    }
    else{
      callback(null, false);
    }
  });
}

//export module

//check the one
module.exports.userFindOne = function(userName,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      //call the findOneUser method
      findOneUser(db,userName,callback);
    }
  });
}

//exports the mothod findOneUserById

module.exports.getOneUserById = function(id,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findOneUserById(db,id,callback);
    }
  });
}

//exports the mothod change user password
module.exports.updatePassword = function(u,modifiedPassword,callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else{
      updateUserPassword(db,u,modifiedPassword,callback);
    }
  })
}

//create a user
module.exports.userCreate = function(userName,password, callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else{
      createUser(db, userName, password, function(err, result){
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

module.exports.findAllUsers = function(callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findUsers(db,callback);
    }
  });
}

module.exports.comparePassword = function(cadidatePassword,hash,callback){
  bcrypt.compare(cadidatePassword,hash,function(err,isMatch){
    if(err) throw err;
    callback(null,isMatch);
  })
}
