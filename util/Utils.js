const UserModel = require('../models/userModel');
const AdminModel = require('../models/adminModel');
const UserBlackListModel = require('../models/userBlackListModel');

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
 * @returns true if email of phone are blacklisted, false otherwise
 */
module.exports.isBlocked = async(email, phone) => {
    const exist = await UserBlackListModel.findOne().or([
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
 * Return reported points in MapsBox format in order to point in the map
 *
 * @param A list of reported points
 *
 * @returns The points in MapBox structure
 */
module.exports.formatPositions = (reports) => {
   var locations = [];
   for(var i = 0; i  < reports.length; i++) {
        const latLong = reports[i].location.coordinates;
        var positionInfo = {
            type: reports[i].type,
            lat: latLong[0],
            long: latLong[1],
            id: reports[i]._id,
            length: reports[i].reports.length
        }
       locations.push(positionInfo);
   }
   return locations;
}