const UserModel = require('../models/userModel');

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
 * @return current user or undefined in case of no user
 */
module.exports.isUserValid = async (req) => {
    console.log("[Server] isUserValid");
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {      
        const user = await UserModel.findOne().and([ 
            {token: req.headers.authorization.split(' ')[1]},
            {status: 'Active'}
        ]);
        return (user ? user : undefined);
    } 
    return undefined;
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
module.exports.formatPoints = (reports) => {
   var locations = [];

   for(var i = 0; i  < reports.length; i++) {
       var p = [];
       latLong = reports[i].position.coordinates;
       
       p.push(reports[i].type);
       p.push(latLong[0]);
       p.push(latLong[1]);

       locations.push(p);
   }
   return locations;
}