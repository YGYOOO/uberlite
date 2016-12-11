var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createDriver = function(db, objRecord, callback){
  db.collection('record').findOne({email: objRecord.email}, function(err, thing){
    if(!thing){
      db.collection('record').insertOne(objRecord, function(err, writeResult){
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

var createRecord = function(db,objRecord,callback){
  db.collection('record').insertOne(objRecord,function(err,result){
    if (result.result.ok!==1) {
      callback(err,null);
    }else {
      callback(null,result);
    }
  })
}

module.exports.recordCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createRecord(db,obj,function(err, result){
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

// var findDriverByEmail = function(db, email, callback){
//   db.collection('driver').findOne({email:email}, function(err,thing){
//     db.close();
//     if(thing){
//       callback(null,thing);
//     }
//     else {
//       callback(null,null);
//     }
//   });
// }
//
//
//
// var findOneDriver1= function(db,obj,callback){
//   db.collection('driver').findOne(obj,function(err,thing){
//     db.close();
//     if(thing){
//       callback(null,thing);
//     }
//     else {
//       callback(null,null);
//     }
//   });
// }
//
// module.exports.driverFindOne = function(obj,callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       //call the findOneUser method
//       findOneDriver1(db,obj,callback);
//     }
//   });
// }
//
//
// var findDrivers= function(db,obj,callback){
//   db.collection('driver').find(obj).toArray(function(err,thing){
//     db.close();
//     if(thing){
//       callback(null,thing);
//     }
//     else {
//       callback(null,null);
//     }
//   });
// }
//
// var findDriverById = function(db, id, callback){
//   db.collection('driver').findOne(mongodb.ObjectID(id), function(err,thing){
//     db.close();
//     if(thing){
//       callback(null,thing);
//     }
//     else {
//       callback(null,null);
//     }
//   });
// }
//
// var updateDriver = function(db, id, obj, callback){
//   db.collection('driver').update({_id: mongodb.ObjectId(id)}, {$set: obj}, function(err, result){
//     db.close();
//     if(result.result.ok !== 1){
//       callback(err, null);
//     }
//     else{
//       callback(null, result);
//     }
//   });
// }
//
// module.exports.driverUpdate = function(id, obj, callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       updateDriver(db, id, obj, callback);
//     }
//   });
// };
//
// module.exports.driversFind = function(obj,callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       //call the findDrivers method
//       findDrivers(db,obj,callback);
//     }
//   });
// }
//
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
//
// module.exports.driverFindById = function(id, callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       //call the findDrivers method
//       findDriverById(db,id,callback);
//     }
//   });
// }
// //deleteDriverByEmailInTemp
//
// var deleteDriverByEmailInTemp = function(db, email, callback){
//   db.collection('temporary_drivers').findOneAndDelete({email:email}, function(err,thing){
//     db.close();
//     if(thing){
//       callback(null,thing);
//     }
//     else {
//       callback(null,null);
//     }
//   });
// }
//
// module.exports.TempDriverDeleteByEmail = function(email,callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       //call the findDrivers method
//       deleteDriverByEmailInTemp(db,email,callback);
//     }
//   });
// }
//
// module.exports.driverFindByEmail = function(email, callback){
//   mongodb.connect(url,function(err,db){
//     if(err){
//       callback(err,null);
//     }
//     else {
//       findDriverByEmail(db,email,callback);
//     }
//   });
// }
