var exports = module.exports = {}

// Debug
verbose = true;

// Requirements
var postmark = require("postmark");
var clickatell = require('clickatell-api');

const clientNumber = "8063a324-3296-4ab2-87a9-b9a4209fdc0c";
const client = new postmark.Client(clientNumber);
const fromEmailAddress = "noreply@universalbitcoin.com";

const cktClient = clickatell('fxbitlab', 'MmKV0cGk@)!)');
const cktHttp = cktClient.http('3584512');



exports.email = function (fromEmail, toEmail, subject, emailBody) {

  fromEmail = fromEmail || fromEmailAddress;

  if(verbose){
    console.log("EMAIL CONTENT:",emailBody +" from:"+fromEmail+" TO:"+toEmail+" SUB:"+subject);
  }

  client.sendEmail({
    "From": fromEmail,
    "To": toEmail,
    "Subject": subject,
    "TextBody":emailBody
  });
}

exports.emailWithTemplate = function (fromEmail, toEmail, subject, userObject, password) {
  fromEmail = fromEmail || fromEmailAddress;
  if (verbose) {
    console.log("EMAIL CONTENT:",password +" from:"+fromEmail+" TO:"+toEmail+" SUB:"+subject);
  }

  client.sendEmailWithTemplate({

    "TemplateModel" : {
      "email" : toEmail,
      "password" : password,
      "firstName" : userObject.firstName,
      "lastName" : userObject.lastName,
      "handPhone" : userObject.phoneNumber
    },
    "TemplateId" : 790181,
    "From": fromEmail,
    "To": toEmail
  }, function(error, success) {
    if(error) {
      console.log(error);
    } else {
      console.log(success);
    }
  });
}

exports.sendSMS = function (toMobile, sms) {
  var promise = cktHttp.sendMessage(toMobile, sms);
  promise.then(
    function (respObj) {
      console.info('SMS sent successfully');
      console.info('SMS ID:' + respObj.ID);
    },

    function (err) {
      console.error('Error in sending SMS');
      if (err.code) {
        // Yes, the library create JS Error from Clickatell error messages
        // and add the message as usual, but it also populates the error
        // under code, however the errors are not always from Clickatell,
        // so check the property
        console.error('Clickatell reported an error with code: ' + err.code);
      }

      console.error('Error message:' + err.message);
    }
  );
}
