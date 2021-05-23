const express = require('express');
const router = express.Router();
const Utils = require('../util/Utils');
const Constants = require('../util/Constants');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const TokenGenerator = require('uuid-token-generator');
const fs = require('fs');

router.post("/new", async (req, res) => {
    const user = await Utils.isUserValid(req);

    if(!user) {
        console.log("[Server] Unvalid user tried to create a report!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    const coordinates = req.body.coordinates;
    const position = { type: 'Point', coordinates: [coordinates[0], coordinates[1]] };

    const tokenGen = new TokenGenerator();
    const reportId = tokenGen.generate();

    const type = req.body.type;

    const report = new ReportModel({        
        description: req.body.description,
        image: req.body.image,
        userId: user.token,
        reportId: reportId
    });

    const currentPositions = await
    PositionModel.findOne().and([
        { type: type },
        { location: {
                $near: {
                    $geometry: position,
                    $maxDistance: 30
                }
            }
        }
    ]);

    var savedPosition = undefined;
    //If reported position already exists
    if(currentPositions) {
        console.log("[Server] Position already registered!");
        currentPositions.reports.push(reportId);
        savedPosition = await currentPositions.save();
    } else {
        console.log("[Server] New position received!");
        const place = new PositionModel({
            type: type,
            location: position,
        });
        place.reports.push(reportId);
        savedPosition = await place.save();
    }
    
    const savedReport = await report.save(); 

    if(savedPosition && savedReport)
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