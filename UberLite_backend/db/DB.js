var driverDb = require('./driverDb.js');
var userDb = require('./user.js');
var adminDb = require('./adminDb.js');
var riderDb = require('./riderDb.js');
var pictureDb = require('./pictureDb.js');
var tripDb = require('./tripDb.js');
var paymentDb = require('./paymentDb.js');
var evaluationDb = require('./evaluationDb.js');
var statisticsDb = require('./statisticsDb.js');
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
module.exports.updateDriverByEmail = driverDb.driverUpdate;
module.exports.deleteDriverInTemp = driverDb.TempDriverDeleteByEmail;
module.exports.updateDriverById = driverDb.driverIdUpdate;

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
module.exports.createTrip = tripDb.tripCreate;
module.exports.paymentRecordCreate = paymentDb.paymentRecordCreate;
module.exports.createUnsuccessfulTrip = tripDb.untripCreate;
module.exports.getTripInfoFindById = tripDb.TripInfoFindById;
module.exports.getAllTripInfo = tripDb.findAllTripInfo;
module.exports.getCanceledTripInfoFindById = tripDb.getCanceledTripInfoFindById;
module.exports.findAllCanceledTrip = tripDb.findAllCanceledTrip;



//
module.exports.createEvaluation = evaluationDb.evaluationCreate;
module.exports.getEvaluationParams = evaluationDb.getEvaluationParams;
module.exports.updateEvaluationByEmail = evaluationDb.updateEvaluationByEmail;
module.exports.getDriverEvaluationByEmail = evaluationDb.getEvaluationByEmail;
module.exports.toGetEvaluationById = evaluationDb.getEvaluationById;


//statistics
module.exports.createStatistics = statisticsDb.statisticsCreate;
module.exports.getStatistics = statisticsDb.statisticsFind;
module.exports.updateStaticsByName = statisticsDb.updateStaticsByName;
module.exports.getAllStatistics = statisticsDb.findAllStatistics;
module.exports.getOneStatistics = statisticsDb.findOneStatistics;
module.exports.deleteStatistics = statisticsDb.toDeleteStatistics;
module.exports.updateStatistics = statisticsDb.toUpdateStatistics;
module.exports.updateStatisticsRiding = statisticsDb.toUpdateStatisticsRiding;
module.exports.updateRidngById = statisticsDb.updateRidingByid;
