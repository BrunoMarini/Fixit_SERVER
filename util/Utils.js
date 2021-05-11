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
module.exports.formatPoints = (point) => {
    var position  = {};
    var type = 'FeatureCollection';
    var features = [];
    position.type = type;
    position.features = features;

    for(var i = 0; i < point.length; i++) {
        var features = buildMapboxStructure(point[i].position.coordinates);
        position.features.push(features);
    }

    console.log("Teste: " + JSON.stringify(position, null, 4));
    return position;
}

function buildMapboxStructure(latLong) {
    var json =
    {
        type: 'Feature',
        geometry: {
        type: 'Point',
        coordinates: [latLong[1], latLong[0]]
        },
        properties: {
        title: 'Mapbox',
        description: 'Washington, D.C.'
        }
    }
    return json
};