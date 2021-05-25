const express = require('express');
const router = express.Router();
const Utils = require('../util/Utils');
const Constants = require('../util/Constants');
const emailAuth = require('./emailAuth');
const UserModel = require('../models/userModel');
const TokenGenerator = require ('uuid-token-generator');


/* Request to register a new user */
router.post("/register", async (req, res) => {
    try {
        console.log("[Server] Register new user");

        // Search for users with the same email or phone 
        const existUser = await UserModel.findOne().or([
            { email: req.body.email},
            { phone: req.body.phone}
        ]);

        // Check if user already exist in DB
        if(existUser) {
            console.log("[Server] User alredy registered");
            return res.status(Constants.HTTP_CONFLICT).json(Utils.createJson(Constants.MESSAGE_REGISTER_CONFLICT));
        } else {
            const tokenGen = new TokenGenerator();
            const user = new UserModel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                token: tokenGen.generate()
            });

            // Saving user in DB
            const saved = await user.save();
            console.log("[Server] New user registered!");

            // Sending email confirmation
            emailAuth.sendConfirmationEmail(saved.name, saved.email, saved.token);

            return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_REGISTER_PENDING));
        }
    } catch (err) {
        console.log(err);
        return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(err));
    }
});

router.post("/login", async (req, res) => {
    console.log("[Server] User login");
    try {
        const user = await UserModel.findOne({email: req.body.email});

        if(user && user.password == req.body.password) {
            if(user.status == "Active") {
                return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_LOGIN_SUCCESS, user.token));
            }

            // Resending email confirmation
            emailAuth.sendConfirmationEmail(user.name, user.email, user.token);

            return res.status(Constants.HTTP_FORBIDDEN).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHENTICATED));
        } else {
            return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_WRONG_EMAIL_PASS));
        }
    } catch (err) {
        console.log(err);
        return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(err));
    }
});

router.post("/validate", async (req, res) => {
    console.log("[Server] Validate user");
    const user = await Utils.isUserValid(req);
    if(!user) {
        console.log("[Server] User not valid!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }
    return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
});

module.exports = router;