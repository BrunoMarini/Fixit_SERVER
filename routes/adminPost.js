const express = require('express');
const router = express.Router();
const AdminModel = require('../models/adminModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');
const TokenGenerator = require ('uuid-token-generator');

/* Request to register a new admin */
router.post("/register", async (req, res) => {
    const tokenGen = new TokenGenerator();
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
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.HTTP_OK));
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

module.exports = router;