const express = require('express');
const router = express.Router();
const Utils = require('../util/Utils');
const Constants = require('../util/Constants');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const ReportValidation = require('../util/reportValidationScript');
const TokenGenerator = require('uuid-token-generator');
const fs = require('fs');

router.post("/new", async (req, res) => {
    const user = await Utils.isUserValid(req);

    if(!user) {
        console.log("[Server] Invalid user tried to create a report!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    let base64image = req.body.image;
    const imgResult = await ReportValidation.filterOfensiveImage(base64image);
    if (imgResult.isNude) {
        const strikes = await Utils.updateUserStrikes(user);
        const message = (strikes == Constants.MAXIMUM_STRIKE_LIMIT ? "BLOQUEADO" : Constants.MESSAGE_UNAPPROPRIATED_REPORT + " " + strikes + "/" + Constants.MAXIMUM_STRIKE_LIMIT);
        return res.status(Constants.HTTP_FORBIDDEN).json(Utils.createJson(message));
    }

    const imageResult = await ReportValidation.removeFaces(base64image);
    if (imageResult) {
        base64image = imageResult;
    }

    const coordinates = req.body.coordinates;
    const position = { type: 'Point', coordinates: [coordinates[0], coordinates[1]] };

    const tokenGen = new TokenGenerator();
    const reportId = tokenGen.generate();

    const type = req.body.type;
    const description = ReportValidation.filterOfensiveWords(req.body.description);

    const report = new ReportModel({        
        description: description,
        image: base64image,
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
        console.log("[Server] Position found! Checking if user already reported");

        const reports = await ReportModel.find({ reportId: currentPositions.reports });
        for(let i = 0; i < reports.length; i++) {
            if(reports[i].userId == user.token) {
                console.log("[Server] Already reported. Returning");
                return res.status(Constants.HTTP_CONFLICT).json(Utils.createJson(Constants.MESSAGE_REQUEST_CONFLICT));
            }
        }

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

    if(savedPosition && savedReport) {
        user.reportNumber++;
        user.save();
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
    }

    console.log("[Server] Error trying to save new report!");
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.get("/get", async (req, res) => {
    fs.readdirSync(__dirname + '/../upload').forEach(file => {
        console.log('DEBUG: ' + file);
    });
});

module.exports = router;