var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var futures = require('futures');
var sequence = futures.sequence();
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder();
 // var geocoder = require('geocoder');


var transport = nodemailer.createTransport(smtpTransport({
  host: "smtp.gmail.com",
  secure: true,
  secureConnection: true,
  auth: {
    user: "chaohui.xu1@gmail.com",
    pass: 'as65249258',
    tls: true
  }
}));


module.exports.sendReceiptEmail=function toSendProhibitEmail(email,tripInfo,callback){
  var s =null;

    geocoder.reverse({lat:tripInfo.star_location.latitude, lon:tripInfo.star_location.longitude}, function(err, res) {
    if (err) {
      throw err;
    }else {
      s=res[0];
      geocoder.reverse({lat:tripInfo.end_location.latitude, lon:tripInfo.end_location.longitude}, function(err, res) {
        if (err) {
          throw err;
        }else {
          e=res[0];
          var date = new Date(tripInfo.arrival_time);
          var startTime = new Date(tripInfo.pickup_time);
                var receiptMailOptions = {
                  from: 'LiteUber<user@gmail.com>',
                  subject: 'Receipt',
                  to:email,
                  html: '<h1 align="center">UberLite </h1><h2 align="center">Receipt</h2><br /><br />'+
                  '<p>Dear rider:<br />Here is your trip receipt</p>'+'<br /><p>Amount :$'+tripInfo.price
                  +'</p>'+'<br /><p>Date :'+date+'</p>'
                  +'<br /><p>Trip detail,<br />Start time:'+startTime+'End time: '+date +'<br />From '+s.streetNumber+" "+s.streetName+'  '+s.city+'  To  '+e.streetNumber+' '+e.streetName+'  '+e.city+'</p>',
                  text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser'
                }
                  transport.sendMail(receiptMailOptions, function(error,response) {
                    if (error) {
                      callback(error,null);
                    } else {
                      callback(null,response);
                    }
                    transport.close();
                  });
        }

      });
    }
});

}
