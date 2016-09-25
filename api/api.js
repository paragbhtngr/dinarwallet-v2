var exports = module.exports = {};

////////////////////////////////////////////////
//                 VARIABLES                  //
////////////////////////////////////////////////

// MONGO
exports.mongoURL = "mongodb://localhost:27017/dinardirham"; //URL for Mongo to use
exports.freqOfDBUpdates = 60 * 1000; //Amount of ms to wait between writing the prices to Mongo
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


////////////////////////////////////////////////
//                 FUNCTIONS                  //
////////////////////////////////////////////////

function getBTCInUSD() {
  request('https://api.coindesk.com/v1/bpi/currentprice/USD.json', function (error, response, body) {
    if (!error && response.statusCode == 200 && JSON.parse(body) ) {
      var btcInUSD = JSON.parse(body).bpi.USD.rate;
      return btcInUSD;
    } else {
      if(response) {
        console.log(response.statusCode);
      }
      console.log(error);
      //callback(false)
    }
  })
  setTimeout(getBitcoinInUSD, 60000);
}

function getETHInUSD() {
  request('https://etherchain.org/api/statistics/price', function (error, response, body) {
    // TODO: Change next line to be more robust. The current version occasionally crashes
    if(body.indexOf("<")==-1) {
      var parsed = JSON.parse(body);
      if (!error && response.statusCode == 200 && parsed ) {
        ethInUSD = parsed.data[parsed.data.length-1].usd;
        console.log("ETH: ");
        console.log(ethInUSD);
        return ethInUSD;
      } else {
        console.log(response.statusCode);
        callback(false)
      }
    }
  })
  setTimeout(getETHInUSD, 60000);
}


var setGSCBalance = function(smartXAddress, GSCAddress, i, j, balance) {
	console.log("SET GSC")
	console.log(smartXAddress, GSCAddress, i, j, balance);
	if(GSCAddress && GSCAddress!="0x") {
		(function(j){
			if(GSCAddress!="0x0000000000000000000000000000000000000000") {
				console.log("test 1")
		    	var GSC = ethereum.createContractFromAddress(goldSmartContract, GSCAddress);
		    	console.log("test 2")
		    	if(GSC && GSC.denomination) {
			    	GSC.denomination(function(error, gscDenomination) {
			    		console.log("test 3")
				    	if(!error && (balance[gscDenomination] || balance[gscDenomination]==0)) {
				    		console.log("J: " + j);
							console.log(gscDenomination);
					    	balance[gscDenomination]++;
					    	balance[gscDenomination + "a"].push([j,GSCAddress]);
				    	}
			    	})
		    	}
	    	}
    	})(j)
    	j+=1;
    	GSCBankContract.contractsOf(smartXAddress, j, function(err, GSCAddress){
    		setGSCBalance(smartXAddress, GSCAddress, i, j, balance)
    	})
    } else {
    	if(smartXAddress) {
		    goldBankContract.balanceOf(smartXAddress, function(erro, dinar){
				balance.dinar = dinar/10000;
				global.ethereumBalances[i] = balance;
			})
		} else {
			balance.dinar = 0;
			global.ethereumBalances[i] = balance;
		}
    }
}

function getBitcoinBalance(address, callback) {
	console.log("address")
	console.log(address);
	request('https://blockexplorer.com/api/addr/'+address, function (error, response, body) {
		if (response.statusCode == 200 ) {
			console.log(JSON.parse(body));
			if(JSON.parse(body).unconfirmedBalance < 0) {
	    		callback(parseFloat(JSON.parse(body).balance)+parseFloat(JSON.parse(body).unconfirmedBalance));
	    	} else {
		    	callback(parseFloat(JSON.parse(body).balance))
	    	}
		} else if(response.statusCode == 404) {
			callback(0)
		} else {
			console.log(response.statusCode);
			callback(0);
		}
	})
}


var getEthereumBalances = function() {
	if(global.ethereum.finishedSetup) {
		var startTime = new Date().getTime();
		domain.dinarUser.find({role:"role_user"},"smartXAddress bitcoinAddress ethAddress",function(err, users){
			balances = [];
			var getBTC = false;
			if(btcCounter >= 6*10) {
				getBTC = true;
				btcCounter = 0;
			} else {
				btcCounter++;
			}
			for(var i=0;i<users.length;i++) {
				console.log("Time for user " + i + ": " + (new Date().getTime() - startTime));
				if(users[i].smartXAddress && users[i].smartXAddress!="Pending") {
					(function(i, smartXAddress){
						if(!global.otherBalances[i]) {
							global.otherBalances[i] = {};
						}
						global.otherBalances[i].smartXAddress = users[i].smartXAddress;
						global.otherBalances[i].bitcoinAddress = users[i].bitcoinAddress;
						global.otherBalances[i].ethAddress = users[i].ethAddress;
						console.log("Time for user " + i + " after balances: " + (new Date().getTime() - startTime));
						//console.log("b");

						try {
							balances[i].ethBalance = web3.eth.getBalance(users[i].ethAddress,
									function(er, ethBalance){
										global.otherBalances[i].ethBalance = web3.fromWei(ethBalance)
									}
								)
						} catch (err) {

						}

						console.log("Time for user " + i + " after ethBalance: " + (new Date().getTime() - startTime));
						//console.log("c");
						//10 mins
						if(getBTC) {
							(function(i) {
								console.log("getting BTC Balance" + users[i].bitcoinAddress);
								getBitcoinBalance(users[i].bitcoinAddress, function(btcBalance){
									console.log("BTC BALANCE: " + btcBalance);
									if(global.otherBalances[i]) {
										if(!isNaN(btcBalance)) {
								    		global.otherBalances[i].bitcoinBalance = btcBalance;
								    	} else if(!global.otherBalances[i].bitcoinBalance) {
									    	global.otherBalances[i].bitcoinBalance = 0;
								    	}
								    }
							    })
						    })(i)
					    }
					    console.log("Time for user aft btc" + i + ": " + (new Date().getTime() - startTime));
					    //console.log("d");
					    console.log("SMARTX IS " + smartXAddress);
					    GSCBankContract.contractsOf(smartXAddress, 0, function(err, GSCAddress){
					    	bal = {smartXAddress:smartXAddress};
					    	for(var j=0;j<GSCList.length;j++) {
							    bal[GSCList[j]] = 0;
							    bal[GSCList[j] + "a"] = [];
						    }
						    console.log("BAL IS " + JSON.stringify(bal));
					    	console.log("PRE SET GSC",err, GSCAddress)
						    setGSCBalance(smartXAddress, GSCAddress, i, 0, JSON.parse(JSON.stringify(bal)))
					    });
				    })(i, users[i].smartXAddress)
				    //console.log("e");
			    } else {
				    users.splice(i, 1);
				    i--;
			    }
			}
			//global.otherBalances = balances.slice();
			console.log("Total Time: " + (new Date().getTime() - startTime));
		})
		setTimeout(getEthereumBalances, 60000)
	} else {
		setTimeout(getEthereumBalances, 1000)
	}
}


var init = function() {
  var btcInUSD = getBTCInUSD();
  var ethInUSD = getETHInUSD();


  ethereumBalances = [];
  otherBalances = [];

  getEthereumBalances();
}
