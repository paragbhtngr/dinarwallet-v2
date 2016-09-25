// Set up expressJS
var http = require('http');
var https = require('https');
var path = require('path');
var sio = require('socket.io');
var express = require('express');
var cors = require('cors');

// Set config
// TODO: Remove global vars from code before opensourcing
var quotesConfig = { ip: '192.210.232.249', port: 8083, login: 'test', password: 'qwe123' };
var masterConfig = { ip: '192.210.232.249', port: 8887, master: 'SecurePass123' };

// Import currency libraries
var mt4Server = require('./libs/mt4')(masterConfig);
var bitcoin = require('bitcoinjs-lib');
var ethereum = require("./ethereum/ethereum.js");
var Web3 = require('web3');

// Import contract libraries
var actionManager = require("./contracts/ActionManager.js");
var smartX = require("./contracts/SmartX.js");
var goldBank = require("./contracts/GoldBank.js");
var actionWithdraw = require("./contracts/ActionWithdraw.js");
var actionDeposit = require("./contracts/ActionDeposit.js");
var actionTransfer = require("./contracts/ActionTransfer.js");
var goldSmartContract = require("./contracts/GoldSmartContract.js");
var goldSmartContractBank = require("./contracts/GoldSmartContractBank.js");
var actionCreateGoldSmartContract = require("./contracts/ActionCreateGoldSmartContract.js");
var actionDestroyGoldSmartContracts = require("./contracts/ActionDestroyGoldSmartContracts.js");
var actionTransferGoldSmartContracts = require("./contracts/ActionTransferGoldSmartContracts.js");

// Database files
require('./mongo/mongoConnection.js');
require('./mongo/mongodbDomains.js');

// Import modules
var api = require('./api/api');
var email = require('./api/email');



global.app = express();
app.use(cors());

//parsing the request
var bodyParser=require('body-parser');
app.use(bodyParser())
app.set('view engine', 'ejs');

var Web3 = require('web3');



//SSL
// var ssl_options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/universalbitcoin.com/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/universalbitcoin.com/cert.pem'),
//     ca: [
//     	fs.readFileSync('./keys/lets-encrypt-x3-cross-signed.pem')
//     ]
// };

var httpio = http.createServer(app).listen(api.ioPort);
io = sio.listen(httpio);

// var httpsio = https.createServer(ssl_options, app).listen(api.iosPort);
// global.ios = sio.listen(httpsio);

app.use("/", express.static(path.join(__dirname, 'public')));

app.get("/",function(req,res,next){
	res.sendFile(__dirname +'/public/dinar.html');
})

app.get("/client",function(req,res,next){
	res.sendFile(__dirname +'/public/wallets/index.html');
})

app.get("/getHistoryQuotes/:bidask/:symbol/:period",function(req,res,next){
	if(historyQuotes[req.params.bidask] && historyQuotes[req.params.bidask][req.params.period] && historyQuotes[req.params.bidask][req.params.period][req.params.symbol]) {
		res.send(historyQuotes[req.params.bidask][req.params.period][req.params.symbol]);
	} else {
		res.send([]);
	}
})

app.get("/dinar/ticket1",function(req,res,next){
	res.sendFile(__dirname +'/public/tickets/ticket1.html');
})


// Set up bitcoin

// Set up ethereum
ethereum = require("./ethereum/ethereum.js");
ethereumBalances = [];


// global.quotes = {};
// global.bidAsk = require('./ex/bidask.js');
