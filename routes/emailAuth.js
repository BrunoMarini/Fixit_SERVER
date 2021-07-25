const nodemailer = require("nodemailer");
const UserModel = require('../models/userModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');

module.exports.sendAdminConfirmationEmail = function(institution, email) {
    console.log("[Server] Send admin confirmation email!");

    const transport = getEmailTransport();
    const website = getWebsiteLink();

    const path = require('path');
    const filePath = path.join(__dirname + '/../public/img/logo.png');

    const fixIt = "Contato FixIt <" + process.env.EMAIL_USER + ">";

    //Sending the email
    transport.sendMail({
        from: fixIt,
        to: email,
        subject: "FixIt: Cadastro de Administrador",
        html:   `<style>
                .separation {
                    border-top:5px;
                    border-bottom: 0px;
                    border-left: 0px;
                    border-right: 0px;
                    border-style: groove;
                }
                </style>
                <center><img src="cid:unique@kreata.ee"/></center>
                <h1>Cadastro de Administrador</h1>
                <h2>Olá, ${institution}!</h2>
                <p>Sua requisição para se tornar um administrador foi iniciada com sucesso! Nossa equipe está analisando suas informações e logo entraremos em contato!</p>
                <p>Obrigado pelo seu interesse no FixIt!</p>
                <br>
                <p> Enquanto processamos sua requisição você pode acompanhar os reportes no nosso <a href=${website}> WEBSITE </a></p>
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
}

module.exports.sendUserConfirmationEmail  = function(name, email, confirmationCode) {
    console.log("[Server] Send user confirmation email!");

    const transport = getEmailTransport();
    const website = getWebsiteLink();
    const link = getConfirmationLink(confirmationCode);

    const path = require('path');
    const filePath = path.join(__dirname + '/../public/img/logo.png');

    const fixIt = "Contato FixIt <" + process.env.EMAIL_USER + ">";

    // Sending the email
    transport.sendMail({
        from: fixIt,
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

function getEmailTransport() {
    // Fixit email setup
    return transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Localhost or server test purpose
function getWebsiteLink() {
    return (process.env.NODE_ENV == process.env.NODE_ENV_PROD ? "https://fixit-city.herokuapp.com/" : "http://localhost:3030/");
}

// Localhost or server test purpose
function getConfirmationLink(code) {
    let link = '';
    if (process.env.NODE_ENV == process.env.NODE_ENV_PROD) {
        link = "https://fixit-city.herokuapp.com/confirm/";
    } else {
        link = "http://localhost:3030/confirm/";
    }
    link += code
    return link;
}

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