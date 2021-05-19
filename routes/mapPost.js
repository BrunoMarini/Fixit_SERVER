const express = require('express');
const router = express.Router();
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');

router.get('/getReports', async (req, res) => {
    const positions = await PositionModel.find();
    if(positions) {
        return res.status(Constants.HTTP_OK).json(Utils.formatPositions(positions));
    }
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.post('/getPoint/:id', async (req, res) => {
    const id = req.params.id;
    if(!id) {
        return status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_FOUND));
    }
    const position = await PositionModel.findOne({ _id: id });
    const reportIds = position.reports;

    const reports = await
    ReportModel.find({ reportId: reportIds});
 
    return res.status(Constants.HTTP_OK).json(reports);
});

module.exports = router;