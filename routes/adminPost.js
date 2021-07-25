const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');
const ReportModel = require('../models/reportModel');
const PositionModel = require('../models/positionModel');
const EmailAuth = require('./emailAuth');
const ResolvedPositionModel = require('../models/resolvedPositionModel');
const Constants = require('../util/Constants');
const Utils = require('../util/Utils');
const TokenGenerator = require ('uuid-token-generator');

/* Request to register a new admin */
router.post("/register", async (req, res) => {
    const tokenGen = new TokenGenerator();
    console.log("[Server] Admin register");

    if (await Utils.isBlocked(req.body.email, req.body.phone)) {
        console.log("[Server] Blocked user tried to request to be admin");
        return res.status(Constants.HTTP_FORBIDDEN).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    const userData = req.body;
    if (userData.institution == undefined || userData.sector == undefined || userData.email == undefined
            || userData.phone == undefined || userData.desc == undefined) {
        return res.status(Constants.HTTP_NOT_ACCEPTABLE).json(Utils.createJson(Constants.MESSAGE_EMPTY_FIELD));
    }

    const adm = new AdminModel({
        institution: userData.institution,
        sector: userData.sector,
        email: userData.email,
        phone: userData.phone,
        description: userData.desc,
        token: tokenGen.generate()
    });

    const saved = await adm.save();
    if(saved) {
        EmailAuth.sendAdminConfirmationEmail(saved.institution, saved.email);
        console.log("[Server] New admin request completed successfully");
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
    }
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

    if(req.body.blockUser) {
        if (await Utils.blockUser(report.userId)) {
            console.log("[Server] User blocked by admin");
        } else {
            console.log("[Server] Error during admin bloking user");
        }
    }
    return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));
});

router.post("/resolveReport", async (req, res) => {
    console.log("[Server] Resolve Location");

    const admin = await Utils.isAdminValid(req);
    if(!admin) {
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    const position = await PositionModel.findOneAndDelete({ _id: req.body.resolvedLocation });
    if(!position) {
        return res.status(Constants.HTTP_NOT_FOUNT).json(Utils.createJson(Constants.MESSAGE_NOT_FOUND));
    }

    deleteReportsAndUpdateUserInfo(position.reports);
    savePositionResolved(position);

    return res.status(Constants.HTTP_OK).json(Utils.MESSAGE_SUCCESS);
});

async function deleteReportsAndUpdateUserInfo(rep) {
    for(let i = 0; i < rep.length; i++) {
        const report = await ReportModel.findOneAndDelete({ reportId: rep[i] });
        const user = await UserModel.findOne({ token: report.userId });
        user.reportSolved++;
        user.save();
    }
}

async function savePositionResolved(pos) {
    const position = {
            type: 'Point',
            coordinates: [pos.location.coordinates[0], pos.location.coordinates[1]]
        };
    const resolved = await
    ResolvedPositionModel.findOne().and([
        { type: pos.type },
        { location: {
                $near: {
                    $geometry: position,
                    $maxDistance: 30
                }
            }
        }
    ]);

    if(resolved) {
        console.log("[Server] Adding resolved position");
        resolved.reports += pos.reports.length;
        resolved.save();
    } else {
        console.log("New resolved position");
        const res = new ResolvedPositionModel({
            type: pos.type,
            location: pos.location,
            reports: pos.reports.length
        });
        res.save();
    }
}

module.exports = router;