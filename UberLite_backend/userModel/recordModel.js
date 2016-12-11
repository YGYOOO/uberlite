var mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');



var recordSchema = mongoose.Schema({
  rider_email:String,
  driver_email:String,
  start_location:{ },
  end_location:{ },
  price:String,
  rating:String
});


//will create a collection named drivers
recordSchema.set('collection','record')
module.exports = mongoose.model('record',recordSchema);
