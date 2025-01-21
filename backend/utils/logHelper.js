const { getcurrentdate } = require("./getCurrentTime");

exports.LogHelper = (message) => {
    console.log(`[${getcurrentdate()}] :: ${message}`);
}