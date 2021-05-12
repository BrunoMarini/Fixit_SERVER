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
        const date = Utils.getFormattedDate();
        const name = date + "_" + file.originalname;
        cb(null, name);
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
        fs.unlinkSync(req.file.path);
        console.log("[Server] Unvalid user tried to create a report!");
        return res.status(Constants.HTTP_UNAUTHORIZED).json(Utils.createJson(Constants.MESSAGE_NOT_AUTHORIZED));
    }

    const coordinates = req.body.coordinates;
    const position = { type: 'Point', coordinates: [coordinates[0], coordinates[1]] };

    const report = new ReportModel({        
        type: req.body.type,
        description: req.body.description,
        position: position,
        image: req.file.path
    });
    
    const saved = await report.save();

    if(saved)
        return res.status(Constants.HTTP_OK).json(Utils.createJson(Constants.MESSAGE_SUCCESS));

    console.log("[Server] Error trying to save new report!");
    return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(Utils.createJson(Constants.MESSAGE_INTERNAL_ERROR));
});

router.get("/get", async (req, res) => {
    //fs.read
    //read.pipe(img)
});

module.exports = router;