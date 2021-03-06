var mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');

var driverSchema = mongoose.Schema({
  email:String,
  password:String,
  full_name:String,
  licence:String,
  phone:String,
  score:Number,
  status:String,
  active:Boolean,
  authorized:Boolean,
  driver_picture:String,
  car_picture:String,
  car_type:String,
  licence_picture:String
});

driverSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
};
//will create a collection named drivers
driverSchema.set('collection','driver');
module.exports = mongoose.model('driver',driverSchema);
