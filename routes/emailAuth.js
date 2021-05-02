const nodemailer = require("nodemailer");
const UserModel = require('../models/userModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');

module.exports.sendConfirmationEmail  = function(name, email, confirmationCode) {
    console.log("[Server] Send confirmation email!");
   
    // Fixit email setup
    const transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Set localhost or server for test purpose
    let port = process.env.PORT;
    let link = "https://fixit-city.herokuapp.com/confirm/" + confirmationCode; 
    if (port == undefined){
        port = 3030;
        link = "http://localhost:" + port + "/confirm/" + confirmationCode;        
    }

    // Sending the email
    transport.sendMail({
        from: name,
        to: email,
        subject: "Please confirm your account",
        html: `<h1>Email Confirmation</h1>
                <h2>Hello ${name}</h2>
                <p>You are one step from helping your city</p>
                <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
                <a href=${link}> Click here </a>
                </div>`,
    }).catch(err => console.log(err));
};

module.exports.verifyEmail = (req, res) => {
    console.log("[Server] VerifyEmail");
    UserModel
        .findOne({ token: req.params.confirmationCode})
        .then((user) => {
            if(!user) {
                return res.json(Utils.createResponseJson(Constants.HTTP_NOT_FOUNT, Constants.MESSAGE_CONFIRMATION_FAILED));
            }

            user.status = "Active";
            user.save((err) => {
                if(err) {
                    return res.json(Utils.createResponseJson(Constants.HTTP_INTERNAL_SERVER_ERROR, Constants.MESSAGE_INTERNAL_ERROR));
                } else {
                    return res.json(Utils.createResponseJson(Constants.HTTP_OK, Constants.MESSAGE_REGISTER_SUCCESS));
                }
            });
        })
        .catch((e) => console.log("Error", e));  
};