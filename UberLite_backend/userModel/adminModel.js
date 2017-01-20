var mongoose = require('mongoose'),
  bcrypt = require('bcryptjs');

var adminSchema = mongoose.Schema({
  username:String,
  password:String,
});

adminSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
};
//will create a collection named drivers
adminSchema.set('collection','admin')
module.exports = mongoose.model('admin',adminSchema);
