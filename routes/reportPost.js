const express = require('express');
const router = express.Router();
const Utils = require('../util/Utils');
const Constants = require('../util/Constants');
const ReportModel = require('../models/reportModel');
const fs = require('fs');

router.post("/new", async (req, res) => {
    const user = await Utils.isUserValid(req);
    
    if(!user) {
        console.log("[Server] Unvalid user tried to create a report!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    const coordinates = req.body.coordinates;
    const position = { type: 'Point', coordinates: [coordinates[0], coordinates[1]] };

    const report = new ReportModel({        
        type: req.body.type,
        description: req.body.description,
        position: position,
        image: req.body.image
    });
    
    const saved = await report.save();

    if(saved)
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));

    console.log("[Server] Error trying to save new report!");
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.get("/get", async (req, res) => {
    fs.readdirSync(__dirname + '/../upload').forEach(file => {
        console.log('DEBUG: ' + file);
    });
});

module.exports = router;