var mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');

var tripSchema = mongoose.Schema({
  rider_email:String,
  driver_email:String,
  start_time:String,
  end_time:String,
  distance:String,
});


tripSchema.set('collection','trip')
module.exports = mongoose.model('trip',tripSchema);
