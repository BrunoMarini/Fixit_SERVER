const express = require('express');
const router = express.Router();
const Utils = require('../util/Utils');
const Constants = require('../util/Constants');
const ReportModel = require('../models/reportModel');
const fs = require('fs');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { 
        fileSize: 1024 * 1024 * 5 //Files up to 5 Mb
    }
});


var type = upload.single('reportImg');

router.post("/new", type, async (req, res) => {
    const user = await Utils.isUserValid(req);

    if(!user) {
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    var report = new ReportModel({
        name: 'testName',
        desc: 'testDesc',
        image: req.file.path
    });
    
    const saved = report.save();

    if(saved)
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));

    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.get("/get", async (req, res) => {
    //fs.read
    //read.pipe(img)
});

module.exports = router;