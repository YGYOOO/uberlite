var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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

module.exports.sendProhibitEmail=function toSendProhibitEmail(email,callback){
  var prohibitiveMailOptions = {
    from: 'LiteUber<user@gmail.com>',
    subject: 'PROHIBIT',
    to:email,
    html: '<h1 align="center">LiteUber </h1><h2 align="center">PROHIBIT</h2><br /><br /><p>Dear driver:<br />  According to your recent ranting, We decide to prohibit you to contiune as a dirver.</p>',
    text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser'
  }

  transport.sendMail(prohibitiveMailOptions, function(error,response) {
    if (error) {
      callback(error,null);
    } else {
      callback(null,response);
    }
    transport.close();
  });
}
