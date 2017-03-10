var mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');

var riderSchema = mongoose.Schema({
  email:String,
  password:String,
  full_name:String,
  phone:String,
  creditCard_number:String,
  creditCard_name:String,
  creditCard_expire:String,
  authorized:Boolean ,

  //  age:String,
  //   sex:String,
});

riderSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
};
//will create a collection named drivers
riderSchema.set('collection','rider')
module.exports = mongoose.model('rider',riderSchema);
