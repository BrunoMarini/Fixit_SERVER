const express = require('express');
const router = express.Router();
const ReportModel = require('../models/reportModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');

router.get('/getReports', async (req, res) => {
    const reports = await ReportModel.find();
    
    if(reports) {
        return res.status(Constants.HTTP_OK).json(Utils.formatPoints(reports));
    }
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

module.exports = router;