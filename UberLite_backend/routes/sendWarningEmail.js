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

module.exports.sendWarningEmail=function toSendWaringEmail(email,callback){
  var warningMailOptions = {
    from: 'LiteUber<user@gmail.com>',
    subject: 'Warnig',
    to:email,
    html: '<h1 align="center">LiteUber </h1><h2 align="center">Warning</h2><br /><br /><p>Dear driver:<br />  According to your recent ranting, it is below our standard.Please improve your score</p>',
    text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser'
  }

  transport.sendMail(warningMailOptions, function(error,response) {
    if (error) {
      callback(error,null);
    } else {
      callback(null,response);
    }
    transport.close();
  });
}
