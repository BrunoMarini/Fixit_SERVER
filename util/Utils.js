const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');
const PositionModel = require('../models/positionModel');
const UserBlackListModel = require('../models/userBlackListModel');
const haversine = require("haversine-distance");
const path = require('path');

/* 
 * Auxiliar function to create response JSON 
 */
module.exports.createJson = (...message) => {
    switch (message.length) {
        case 1:
            return {
                'message': message[0]
            };
        case 2:
            return {
                'message': message[0],
                'token': message[1]
            }
    }
};

/**
 * Auxiliar async function to verify if user is valid 
 * 
 * @param User request req to retrieve Bearer token
 * 
 * @return current user if it exists, undefined otherwise
 */
module.exports.isUserValid = async (req) => {
    console.log("[Server] isUserValid");
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {      
        const user = await UserModel.findOne().and([ 
            {token: req.headers.authorization.split(' ')[1]},
            {status: 'Active'}
        ]);
        return user;
    } 
    return undefined;
}

/**
 * Auxiliar async function to verify if admin is valid
 *
 * @param Admin request req to retrieve Bearer token
 *
 * @return current admin if it exists, undefined otherwise
 */
module.exports.isAdminValid = async(req) => {
    console.log("[Server] isAdminValid");
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const admin = await AdminModel.findOne().and([
            { token: req.headers.authorization.split(' ')[1] },
            { status: 'Active' }
        ]);
        return admin;
    }
    return undefined;
}

/**
 * Auxiliar function to verify if current email or password are blacklisted
 *
 * @param {NullAble} email to verify
 * @param {NullAble} phone to verify
 *
 * @returns true if email or phone are blacklisted, false otherwise
 */
module.exports.isBlocked = async(email, phone) => {
    const exist = await UserBlackListModel.findOne().or([
        { email: email },
        { phone: phone }
    ]);
    return (exist ? true : false);
}

/**
 * Auxiliar function to verify if current email or password are registered
 *
 * @param {NullAble} email to verify
 * @param {NullAble} phone to verify
 *
 * @returns true if email or phone are registered, false otherwise
 */
module.exports.isRegistered = async(email, phone) => {
    const exist = await UserModel.findOne().or([
        { email: email },
        { phone: phone }
    ]);
    return (exist ? true : false);
}

/**
 * Get formatted date string from current time
 * 
 * FROM: yyyy-mm-ddThh:mm:ss.msmsZ
 * TO:   yyyy-mm-dd_hh.mm.ss_name
 * 
 * @returns formatted date
 */       
module.exports.getFormattedDate = () => {
    var date = new Date();
    date.toLocaleString();
    date = date.toISOString();     
    date = date.split('T').join('_').split('Z').join('.').split('.')[0];
    date = date.split(':').join('.');
    return date;
}

/**
 * Return reported points in order to populate map
 *
 * @param reports list of reported points
 * @param isResolved boolean to determinates if it is resolved reports
 * or not
 *
 * @returns Points
 */
module.exports.formatPositions = (reports, isResolved) => {
   var locations = [];
   for(let i = 0; i  < reports.length; i++) {
        const latLong = reports[i].location.coordinates;
        let length;
        if(isResolved) {
            length = reports[i].reports;
        } else {
            length = reports[i].reports.length;
        }

        const valid = isDistanceValid(locations, latLong);
        if(valid != -1) {
            locations[valid].type = 'Multiple';
            locations[valid].length += length;
        } else {
            var positionInfo = {
                type: reports[i].type,
                lat: latLong[1],
                long: latLong[0],
                id: reports[i]._id,
                length: length
            }
           locations.push(positionInfo);
        }
   }
   return locations;
}

function isDistanceValid(locations, coordinate) {
    const point2 = { lat: coordinate[1], lng: coordinate[0] };
    for(let i = 0; i < locations.length; i++) {
        const point1 = { lat: locations[i].lat, lng: locations[i].long };
        const dist = haversine(point1, point2);
        if(dist < 10) return i;
    }
    return -1;
}

/**
 * Auxiliar function to return all near position
 *
 * @param {*} position position to find the near ones
 * @returns an array list of report IDs
 */
module.exports.getNearReports = async (position) => {
    const reportIds = position.reports;
    const coordinates = position.location.coordinates;
    const point = { type: 'Point', coordinates: [coordinates[0], coordinates[1]] };
    const nearReports = await
    PositionModel.find({
        location: {
            $near: {
                $geometry: point,
                $maxDistance: 10
            }
        }
    });
    for(let i = 0; i < nearReports.length; i++)
        reportIds.push.apply(reportIds, nearReports[i].reports);
    return reportIds;
}