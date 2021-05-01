const express = require('express');
const router = express.Router();
const Constants = require('../util/Constants');
const UserModel = require('../models/userModel');
const TokenGenerator = require ('uuid-token-generator');

/* Request to register a new user */
router.post("/register", async (req, res) => {
    try {
        console.log("[Server] Register new user");

        // Search for users with the same email or phone 
        const existUser = await UserModel.find().or([
            { email: req.body.email},
            { phone: req.body.phone}
        ]);

        // Check if user already exist in DB
        if(Object.keys(existUser).length > 0) {
            console.log("[Server] User alredy registered");
            res.json(createResponseJson(Constants.HTTP_CONFLICT, Constants.MESSAGE_CONFLICT));
        } else {
            const tokenGen = new TokenGenerator();
            const user = new UserModel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                token: tokenGen.generate()
            });

            const saved = await user.save();
            console.log("[Server] New user registered!");
            res.json(createResponseJson(Constants.HTTP_OK, Constants.MESSAGE_REGISTER_SUCCESS));
        }
    } catch (err) {
        console.log(err);
        res.json(createResponseJson(Constants.HTTP_INTERNAL_SERVER_ERROR, err));
    }
});

/* Auxiliar function to create response JSON */
function createResponseJson (retCode, retMessage) {
    return {
        'code': retCode,
        'message': retMessage
    };
}

module.exports = router;