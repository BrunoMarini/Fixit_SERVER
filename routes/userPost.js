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
            res.json(Utils.createResponseJson(Constants.HTTP_CONFLICT, Constants.MESSAGE_REGISTER_CONFLICT));
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

            res.json(Utils.createResponseJson(Constants.HTTP_OK, Constants.MESSAGE_REGISTER_PENDING));
        }
    } catch (err) {
        console.log(err);
        res.json(Utils.createResponseJson(Constants.HTTP_INTERNAL_SERVER_ERROR, err));
    }
});

router.post("/login", async (req, res) => {
    console.log("[Server] User login");
    try {
        const user = await UserModel.findOne({email: req.body.email});

        if(user && user.password == req.body.password) {
            if(user.status = "Active") {
                return res.json(Utils.createResponseJson(Constants.HTTP_OK, Constants.MESSAGE_LOGIN_SUCCESS));
            }
            return res.json(Constants.HTTP_FORBIDDEN, Constants.MESSAGE_INTERNAL_ERROR);
        } else {
            return res.json(Utils.createResponseJson(Constants.HTTP_NOT_FOUNT, Constants.MESSAGE_REGISTER_PENDING));
        }
    } catch (err) {
    console.log(err);
    return res.json(Utils.createResponseJson(Constants.HTTP_INTERNAL_SERVER_ERROR, err));
    }
});

module.exports = router;