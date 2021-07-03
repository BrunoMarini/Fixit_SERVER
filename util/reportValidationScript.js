const fs = require('fs');
const Crypto = require('crypto');
const deepai = require("deepai");
const Piii = require("piii");
const piiiFilters = require("piii-filters");
const Utils = require('./Utils');
const path = require('path');

/**
 * Auxiliar function to check if reported images contains
 * unappropriated content.
 * 
 * @param {*} img base 64 img
 * 
 * @returns a JSON containing a boolean that indicates if the image has nude or not,
 *  the score of the validation and the type of detection in case of nude
 */
module.exports.filterOfensiveImage = async (img) => {
    console.log("[Server] Validating image");
    deepai.setApiKey(process.env.DEEPAI_API_KEY);

    const ret = { 
                    isNude: false,
                    score: 0,
                    detection: []
                };

    const fileName = await Crypto.randomBytes(12).toString('hex') + '.jpg';
    const filePath = path.join(__dirname + '/../public/temp/' + fileName);
    const pubLink = "https://fixit-city.herokuapp.com/temp/"+fileName;

    fs.writeFileSync(filePath, img, { encoding: 'base64' }, function(err) {
        if (err) {
            console.log("[Server] Error converting file");
            return -1;
        }
    });

    console.log("[Server] Image write on " + filePath);
    console.log("[Server] Image accessible on " + pubLink);

    if (process.env.NODE_ENV == 'prod') {
        console.log("[Server] Calling validation API");
        var result = await deepai.callStandardApi("content-moderation", {
            image: pubLink
        });

        ret.score = result.output.nsfw_score;
        if (ret.score > 0.60) {
            ret.isNude = true;
            const detections = result.output.detections;
            for (let i = 0; i < detections.length; i++) {
                const name = detections[i].name.split("-")[0];
                ret.detection.push(name);
            }
        }
    }

    fs.unlinkSync(filePath);

    console.log("[Server] Result: ", ret);
    return ret;
}

/**
 * Auxiliar function to check if message contains ofensiveWords
 * and replace it with "*"
 *
 * @param {*} message message to identify if has bad-words
 * 
 * @returns censored message (e.g. f***)
 */
 module.exports.filterOfensiveWords = (message) => {
    const piii = new Piii({
        filters: [
          ...Object.values(piiiFilters),
          'buceta',
          'desgraca',
          'merda',
          'bosta',
          'boxta',
          'vadia',
          'lazarenta',
        ],
        aliases: {
            a: ['2', '4', '@'],
            e: ['3', '&'],
            o: ['0']
        },
        censor: badWord => {
            return /*badWord.charAt(0) + */"*".repeat(badWord.length)
        }
    });
    return piii.filter(message);
}