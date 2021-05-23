const express = require('express');
const router = express.Router();
const AdminModel = require('../models/adminModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');
const TokenGenerator = require ('uuid-token-generator');

/* Request to register a new admin */
router.post("/register", async (req, res) => {
    const tokenGen = new TokenGenerator();
    console.log("[Server] Admin register");
    const adm = new AdminModel({
        institution: req.body.institution,
        sector: req.body.sector,
        email: req.body.email,
        phone: req.body.phone,
        description: req.body.desc,
        token: tokenGen.generate()
    });
    const saved = await adm.save();
    if(saved)
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.post("/login", async (req, res) => {
    try {
        console.log("[Server] Admin Login");
        const admin = await AdminModel.findOne({ email: req.body.email });
        if(admin && admin.status == 'Active') {
            if(admin.password == req.body.password) {
                return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_LOGIN_SUCCESS, admin.token));
            }
        }
        return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHENTICATED));
    } catch (err) {
        console.log("[Server] Error admin login: " + err);
        return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
    }
});

router.post("/deleteReport", async (req, res) => {
    console.log("[Server] Delete report");
    console.log("Text: " + req.body.text);
    console.log("Id: " + req.body.id);
    return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
});

module.exports = router;