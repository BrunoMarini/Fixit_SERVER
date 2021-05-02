/* Auxiliar function to create response JSON */
module.exports.createResponseJson = (retCode, retMessage) => {
    return {
        'code': retCode,
        'message': retMessage
    };
};