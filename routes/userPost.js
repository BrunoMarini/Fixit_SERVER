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

        //Verify with email and/or phone are blocked
        if(await Utils.isBlocked(req.body.email, req.body.phone)) {
            console.log("[Server] Blocked user tried to register");
            return res.status(Constants.HTTP_FORBIDDEN).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
        }

        // Check if user already exist in DB
        if(await Utils.isRegistered(req.body.email, req.body.phone)) {
            console.log("[Server] User alredy registered");
            return res.status(Constants.HTTP_CONFLICT).json(Utils.createJson(Constants.MESSAGE_REGISTER_CONFLICT));
        } else {
            if (req.body.name == undefined || req.body.email == undefined
                    || req.body.phone == undefined || req.body.password == undefined) {
                console.log("[Server] Register request has empty fields");
                return res.status(Constants.HTTP_NOT_ACCEPTABLE).json(Utils.createJson(Constants.MESSAGE_EMPTY_FIELD));
            }

            const hash = Utils.generatePasswordHash(req.body.password);
            const tokenGen = new TokenGenerator();
            const user = new UserModel({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                phone: req.body.phone,
                token: tokenGen.generate()
            });

            // Saving user in DB
            const saved = await user.save();
            console.log("[Server] New user registered!");

            // Sending email confirmation
            emailAuth.sendUserConfirmationEmail(saved.name, saved.email, saved.token);

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
        //Verify with email is blocked
        if(await Utils.isBlocked(req.body.email, undefined)) {
            console.log("[Server] Blocked user tried to login");
            return res.status(Constants.HTTP_FORBIDDEN).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
        }

        const user = await UserModel.findOne({email: req.body.email});

        if(user && Utils.comparePasswordHash(req.body.password, user.password)) {
            if(user.status == "Active") {
                return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_LOGIN_SUCCESS, user.token));
            }

            // Resending email confirmation
            emailAuth.sendUserConfirmationEmail(user.name, user.email, user.token);

            return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHENTICATED));
        } else {
            return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_WRONG_EMAIL_PASS));
        }
    } catch (err) {
        console.log(err);
        return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(err));
    }
});

router.post("/updateRegister", async (req, res) => {
    console.log("[Server] Updating user register");
    const user = await Utils.isUserValid(req);

    if (!user) {
        console.log("[Server] Invalid user tried to update register");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    if (!Utils.comparePasswordHash(req.body.oldPassword, user.password)) {
        return res.status(Constants.HTTP_PRECONDITION_FAILED).json(Utils.createJson(Constants.MESSAGE_OLD_PASSWORD_NOT_VALID));
    }

    let changed = false;
    if (req.body.phone != undefined && req.body.phone != user.phone) {
        if (await Utils.isRegistered(undefined, req.body.phone)) {
            return res.status(Constants.HTTP_CONFLICT).json(Utils.createJson(Constants.MESSAGE_PHONE_REGISTERED));
        }
        changed = true;
        user.phone = req.body.phone;
    }
    if (req.body.name != undefined && req.body.name != user.name) {
        changed = true;
        user.name = req.body.name;
    }
    if (req.body.newPassword != undefined && req.body.newPassword != user.password) {
        changed = true;
        user.password = req.body.newPassword;
    }

    let saved = undefined;
    if (changed) {
        saved = await user.save();
        if (saved) {
            return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_UPDATED_SUCCESSFULLY));
        }
        return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
    }
    return res.status(Constants.HTTP_NOT_ACCEPTABLE).json(Utils.createJson(Constants.MESSAGE_NO_UPDATE_NECESSARY));
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

router.get("/stats", async (req, res) => {
    console.log("[Server] Get user stats");
    const user = await Utils.isUserValid(req);
    if(!user) {
        console.log("[Server] User not valid!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }
    const userInfoJson = {
        reportViews: user.reportViews,
        reportSolved: user.reportSolved,
        reportNumber: user.reportNumber
    };
    return res.status(Constants.HTTP_OK).json(userInfoJson);
});

router.get("/info", async (req, res) => {
    console.log("[Server] Get user info");
    const user = await Utils.isUserValid(req);
    if(!user) {
        console.log("[Server] User not valid!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }
    const userInfoJson = {
        name: user.name,
        email: user.email,
        phone: user.phone,
    };
    return res.status(Constants.HTTP_OK).json(userInfoJson);
});

module.exports = router;