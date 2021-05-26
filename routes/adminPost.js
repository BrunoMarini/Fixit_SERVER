const express = require('express');
const router = express.Router();
const AdminModel = require('../models/adminModel');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
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

//TODO move to blocked array and user black list
router.post("/deleteReport", async (req, res) => {
    console.log("[Server] Delete report");
    const admin = await Utils.isAdminValid(req);
    if(!admin) {
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }
    const report = await ReportModel.findOneAndDelete({ reportId: req.body.id });
    if(!report) {
        return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_FOUND));
    }

    const position = await PositionModel.findOne({ reports: report.reportId });
    if(position) {
        var r = position.reports;
        if(r.length > 1) {
            const index = r.indexOf(report.reportId);
            if(index > -1) {
                r.splice(index, 1);
            }
            position.reports = r;
            const saved = await position.save();
            if(!saved) {
                console.log("[Server] Error saving updated position");
                //Save report again
            }
        } else {
            PositionModel.deleteOne({ reports: report.reportId }, function(err) {
                if(err) console.log(err);
                console.log("[Server] Position deleted successfully!");
            });
        }
    } else {
        //save report again
    }

    //GET POSITION AND DELETE THIS REPORT FROM ARRAY
    if(req.body.blockUser) {
        // GET USER DELTE HIS REPORTS AND UPDATE ALL
    }
    return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
});

module.exports = router;