var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var paymentCreate = function(db, objTrip, callback){
  db.collection('payment_record').findOne(mongodb.ObjectID(objTrip.id), function(err, thing){
    if(!thing){
      db.collection('payment_record').insertOne(objTrip, function(err, writeResult){
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


module.exports.paymentRecordCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      paymentCreate(db,obj,function(err, result){
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
