const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const ResolvedPositionModel = require('../models/resolvedPositionModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');
const url = require('url');

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

router.post('/getPoint/', async (req, res) => {
    const id = req.body.id;
    const type = req.body.type;

    if(!id) {
        return status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_FOUND));
    }

    let reportIds;
    let positions = await PositionModel.findOne({ _id: id });
    if(type == 'Multiple') {
        reportIds = await Utils.getNearReports(positions);
    } else {
        reportIds = positions.reports;
    }

    const reports = await ReportModel.find({ reportId: reportIds});

    updateUserHelpInfo(reports);
    return res.status(Constants.HTTP_OK).json(reports);
});

router.get('/getReportNumbers', async (req, res) => {
    const depredations = await PositionModel.find();

    const response = [];
    let newValue;
    for(let i = 0; i < depredations.length; i++) {
        newValue = true;
        for(let j = 0; j < response.length; j++) {
            if(response[j].type == depredations[i].type) {
                response[j].value += depredations[i].reports.length;
                newValue = false;
                break;
            }
        }
        if(newValue) {
            response.push({
                type: depredations[i].type,
                value: depredations[i].reports.length
            });
        }
    }

    const reports = (await ReportModel.find().sort({ date: 1 }))[0];
    const resolved = (await ResolvedPositionModel.find().sort({ date: 1 }))[0];

    let date = reports.date;
    if (reports.date > resolved.date) {
        date = resolved.date;
    }

    const responseJson = {
        firstDate: date,
        lastDate: new Date(),
        data: response
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

router.post('/getReportInvertal', async (req, res) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    console.log("[Server] Get reports in date interval " + startDate + " - " + endDate);

    const resolved = await ResolvedPositionModel.
                        find({ date: { $gte: startDate, $lte: endDate }}).
                        sort({ date: 1 });
    const reported = await ReportModel.
                        find({ date: { $gte: startDate, $lte: endDate }}).
                        sort({ date: 1 })

    const typesReported = [];

    for (let i = 0; i < resolved.length; i++) {
        let found = false;
        for (let j = 0; j < typesReported.length; j++) {
            if (typesReported[j].type == resolved[i].type) {
                typesReported[j].value += 1;
                found = true;
                break;
            }
        }
        if (!found) {
            typesReported.push({ type: resolved[i].type, value: 1 });
        }
    }
    for (let i = 0; i < reported.length; i++) {
        let found = false;
        let typeReported;
        for (let j = 0; j < typesReported.length; j++) {
            const pos = await PositionModel.findOne({ reports: reported[i].reportId });
            typeReported = pos.type;
            if (typeReported == typesReported[j].type) {
                typesReported[j].value += 1;
                found = true;
                break;
            }
        }
        if (!found) {
            typesReported.push({ type: typeReported, value: 1 });
        }
    }

    const responseJson = {
        resolutionInterval: [{ type: 'Resolved', value: resolved.length },
                                { type: 'Reported', value: reported.length }],
        typeInterval: typesReported
    }

    return res.status(Constants.HTTP_OK).json(responseJson);

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