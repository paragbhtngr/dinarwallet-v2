var exports  = module.exports = {};

//URL for Mongo to use
exports.mongoURL = "mongodb://localhost:27017/dinardirham";

//Amount of ms to wait between writing the prices to Mongo

exports.freqOfDBUpdates = 60 * 1000;

exports.satoshisInBTC = 100000000;
exports.btcFee = Math.round(0.0003 * exports.satoshisInBTC);

//List of Quotes to get
exports.quotesList = ['GOLD_100G', 'GOLD_1DINAR', 'GOLD_1G', 'GOLD_1KG', 'SILVER100Oz', 'SILVER1KG'];
exports.periods = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];
exports.periodList = {M1:60, M5:300, M15:900, M30:1800, H1:3600, H4:14400, D1:86400, W1:604800, MN:18144000};

exports.GSCList = ['GOLD_100G' , 'GOLD_1G', 'GOLD_1KG', 'SILVER100Oz', 'SILVER1KG'];

exports.onServer = 1;
//Ports used by this server
exports.socketPort = 8482 + exports.onServer;
exports.ioPort = 79 + exports.onServer;
exports.iosPort = 8480 + exports.onServer;
exports.httpPort = 8486 + exports.onServer;
exports.httpsPort = 8488 + exports.onServer;
