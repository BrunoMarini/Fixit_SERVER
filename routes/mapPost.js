const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const ResolvedPositionModel = require('../models/resolvedPositionModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');

router.get('/getReports', async (req, res) => {
    const positions = await PositionModel.find();
    if(positions) {
        return res.status(Constants.HTTP_OK).json(Utils.formatPositions(positions, false));
    }
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.get('/getResolved', async (req, res) => {
    const resolvedPos = await ResolvedPositionModel.find();
    if(resolvedPos) {
        return res.status(Constants.HTTP_OK).json(Utils.formatPositions(resolvedPos, true));
    }
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
})

router.post('/getPoint/:id', async (req, res) => {
    const id = req.params.id;
    if(!id) {
        return status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_FOUND));
    }
    const position = await PositionModel.findOne({ _id: id });
    const reportIds = position.reports;

    const reports = await ReportModel.find({ reportId: reportIds});
 
    updateUserHelpInfo(reports);

    return res.status(Constants.HTTP_OK).json(reports);
});

router.get('/getReportNumbers', async (req, res) => {
    const depredations = await PositionModel.find();

    const responseJson = [];
    let newValue;
    for(let i = 0; i < depredations.length; i++) {
        newValue = true;
        for(let j = 0; j < responseJson.length; j++) {
            if(responseJson[j].type == depredations[i].type) {
                responseJson[j].length += depredations[i].reports.length;
                newValue = false;
                break;
            }
        }
        if(newValue) {
            responseJson.push({
                type: depredations[i].type,
                length: depredations[i].reports.length
            });
        }
    }
    return res.status(Constants.HTTP_OK).json(responseJson);
});

router.get('/getDateIndex', async(req, res) => {
    const positions = await PositionModel.find();

    let responseJson = [];
    let newValue;

    //Iterates between all reported positions
    for(let i = 0; i < positions.length; i++) {
        const reports = await ReportModel.find({ reportId: positions[i].reports });
        //Find all reports from current position
        for(let j = 0; j < reports.length; j++) {
            newValue = true;
            //Check if this date was already populated
            for(let k = 0; k < responseJson.length; k++) {
                //If date is found break loop and increase length value
                if(responseJson[k].date == reports[j].date.toDateString()) {
                    newValue = false;
                    responseJson = increaseReport(responseJson, reports[j].date.toDateString(), positions[i].type);
                    break;
                }
            }
            //If date is not add new value to array
            if(newValue) {
                responseJson = createNewValue(responseJson, reports[j].date.toDateString(), positions[i].type);
            }
        }
    }
    res.status(200).json(responseJson);
});

function increaseReport(jsonArray, d, t) {
    for(let i = 0; i < jsonArray.length; i++) {
        if(jsonArray[i].date == d) {
            for(let j = 0; j < jsonArray[i].reports.length; j++) {
                if(jsonArray[i].reports[j].type == t) {
                    jsonArray[i].reports[j].length++;
                    return jsonArray;
                }
            }
        }
    }
    return jsonArray;
}

function createNewValue(jsonArray, d, t) {
    const types = [];
    types.push(oneType('Depredation'));
    types.push(oneType('Road'));
    types.push(oneType('Leak'));
    types.push(oneType('Garbage'));
    types.push(oneType('Flood'));

    let json = {
        date: d,
        reports: types
    };
    jsonArray.push(json);
    jsonArray = increaseReport(jsonArray, d, t);
    return jsonArray;
}

function oneType(t) {
    return {
        type: t,
        length: 0
    };
}

async function updateUserHelpInfo(userLoaded) {
    var userIds = [];
    for(let i = 0; i < userLoaded.length; i++) {
        userIds.push(userLoaded[i].userId);
    }

    if(userIds.length > 0) {
        const usersToUpdate = await UserModel.find({ token: { $in: userIds }});
        for(let i = 0; i< usersToUpdate.length; i++) {
            usersToUpdate[i].reportViews++;
            usersToUpdate[i].save();
        }
    }
}

module.exports = router;