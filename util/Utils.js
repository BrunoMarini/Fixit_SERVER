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