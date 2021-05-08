const UserModel = require('../models/userModel');

/* Auxiliar function to create response JSON */
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

/*
 * Auxiliar async function to verify if user is valid 
 * 
 * @param req to retrieve Bearer token
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