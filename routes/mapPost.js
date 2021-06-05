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