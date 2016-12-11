var driverDb = require('./driverDb.js');
var userDb = require('./user.js');
var adminDb = require('./adminDb.js');
var riderDb = require('./riderDb.js');
var pictureDb = require('./pictureDb.js');
var tripDb = require('./tripDb.js');
//the operation to drivers
//to find drivers
module.exports.findDrivers = driverDb.driversFind;
module.exports.findDriverById = driverDb.driverFindById;
//driver register
module.exports.registerDriver = driverDb.driverCreate;
//find one driver
module.exports.findOneDriver = driverDb.driverFindOne;
module.exports.findOneDriverByEmial = driverDb.driverFindByEmail;
//to active the driver
module.exports.updateDriver = driverDb.driverUpdate;

module.exports.deleteDriverInTemp = driverDb.TempDriverDeleteByEmail;

//operations to pictures

module.exports.findPictures = pictureDb.picturesFind;
module.exports.findPictureById = pictureDb.pictureFindById;
module.exports.deletePicturesExceptD = pictureDb.deleteAllExceptDefualt;


//find one picture
module.exports.findOnePicture = pictureDb.pictureFindOne;
module.exports.findOnePictureByEmial = pictureDb.pictureFindByEmail;
//to active the driver
module.exports.updatePicture = pictureDb.pictureUpdate;




//the operations to rider
module.exports.findRiders = riderDb.ridersFind;

module.exports.findOneRider = riderDb.riderFindOne;

module.exports.findOneRiderByEmial=riderDb.riderFindByEmail;

module.exports.findRiderById = riderDb.riderFindById;

module.exports.registerRider = riderDb.riderCreate;

module.exports.updateRider = riderDb.riderUpdate;

module.exports.findOneUser = userDb.userFindOne;
//
module.exports.findOneAdmin = adminDb.adminFindOne;
module.exports.findAdminById = adminDb.adminFindById;
module.exports.findAllAdmin = adminDb.adminFindAll;
module.exports.deleteRiderInTemp = riderDb.TempRiderDeleteByEmail;



//
module.exports.getDayPrice = tripDb.getPriceByD;
module.exports.getPerKMPrice = tripDb.getPriceByKM;
