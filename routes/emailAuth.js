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
    var link = '', website = '';
    if(process.env.NODE_ENV == 'prod') {
        link = "https://fixit-city.herokuapp.com/confirm/" + confirmationCode;
        website = "https://fixit-city.herokuapp.com/";
    } else {
        link = "http://localhost:3030/confirm/" + confirmationCode;
        website = "http://localhost:3030/";
    }

    const path = require('path');
    const filePath = path.join(__dirname + '/../public/img/logo.png');

    // Sending the email
    transport.sendMail({
        from: name,
        to: email,
        subject: "FixIt: Confirmação de conta",
        html:   `<style>
                .separation {
                    border-top:5px;
                    border-bottom: 0px;
                    border-left: 0px;
                    border-right: 0px;
                    border-style: groove;
                }
                .btn {
                    height: 50px;
                    width: 200px;
                    background-color: #6340ff;
                }
                </style>
                <center><img src="cid:unique@kreata.ee"/></center>
                <h1>Confirmação de Email</h1>
                <h2>Olá, ${name}!</h2>
                <p>Você está a apenas um passo de conseguir ajudar sua cidade!</p>
                <p>Obrigado por se registrar no FixIt! Por favor, confirme seu enderço de email clicando no link a baixo!</p>
                <a href=${link}> CLIQUE AQUI </a>
                <br>
                <p> Caso queira saber como suas denúncias serão visualizadas de uma olhada no nosso <a href=${website}> WEBSITE </a></p>
                <p class="separation"></p>
                <p>Você está recebendo esse email por ter se registrou no FixIt. Caso esse email tenha sido enviado
                para você por engano, por favor ignore.</p>
                </div>`,
        attachments: [{
            filename: 'logo.png',
            path: filePath,
            cid: 'unique@kreata.ee' //same cid value as in the html img src
        }]
    }).catch(err => console.log(err));
};

module.exports.verifyEmail = (req, res) => {
    console.log("[Server] VerifyEmail");
    UserModel
        .findOne({ token: req.params.confirmationCode})
        .then((user) => {
            if(!user) {
                return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_CONFIRMATION_FAILED));
            }

            user.status = "Active";
            user.save((err) => {
                if(err) {
                    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
                } else {
                    return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_REGISTER_SUCCESS));
                }
            });
        })
        .catch((e) => console.log("Error", e));  
};