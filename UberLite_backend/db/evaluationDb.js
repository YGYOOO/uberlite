var mongodb = require('mongodb');
var url = "mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite";

//create a user
var createEvaluation = function(db, objTrip, callback){
  db.collection('driver_evaluation').findOne(mongodb.ObjectID(objTrip.id), function(err, thing){
    if(!thing){
      db.collection('driver_evaluation').insertOne(objTrip, function(err, writeResult){
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


module.exports.evaluationCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createEvaluation(db,obj,function(err, result){
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


var getDriverEvaluation= function(db, email, callback){
  db.collection('driver_evaluation').findOne({email:email}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.getEvaluationByEmail = function(email, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      getDriverEvaluation(db,email,callback);
    }
  });
}


var updateDriverEvaluationByEmail = function(db,email,obj,callback){
  db.collection('driver_evaluation').updateOne({email:email},obj,function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}

module.exports.updateEvaluationByEmail = function(email,obj, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      updateDriverEvaluationByEmail(db,email,obj,callback);
    }
  });
}






var getEvaluationStandard = function(db, type, callback){
  db.collection('evaluation_params').findOne({params_type:type}, function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
}


module.exports.getEvaluationParams = function(type, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      getEvaluationStandard(db,type,callback);
    }
  });
}
