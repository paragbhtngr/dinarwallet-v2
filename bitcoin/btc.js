var exports = module.exports = {};


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

function getIncomingBitcoin(address, callback) {
	request('https://blockexplorer.com/api/txs/?address='+address, function (error, response, body) {
		if (response.statusCode == 200 ) {
			console.log(JSON.parse(body));
			var txs = JSON.parse(body).txs;
			var txsToReturn = [];
			for(var i=0;i<txs.length;i++) {
				var toMe = true;
				for(var j=0;j<txs[i].vin.length;j++) {
					if(txs[i].vin[j].addr == address) {
						toMe = false;
					}
				}
				if(toMe) {
					for(var j=0;j<txs[i].vout.length;j++) {
						for(var k=0;k<txs[i].vout[j].scriptPubKey.addresses.length;k++) {
							if(txs[i].vout[j].scriptPubKey.addresses[k] == address) {
								txsToReturn.push({"createdAt":parseInt(txs[i].time)*1000,"hash":txs[i].txid,"amt":txs[i].vout[j].value,"from":txs[i].vin[0].addr,"to":address,"confirmations":txs[i].confirmations,"btcOrETH":"BTC","type":"BTC Transfer"})
								toMe = true;
							}
						}
					}
				} else{
					txsToReturn.push({"createdAt":txs[i].time*1000,"hash":txs[i].txid,"amt":(txs[i].vout[1]?txs[i].vout[1].value:txs[i].vout[0].value),"to":(txs[i].vout[1]?txs[i].vout[1].scriptPubKey
.addresses[0]:txs[i].vout[0].scriptPubKey
.addresses[0]),"from":address,"confirmations":txs[i].confirmations,"btcOrETH":"BTC","type":"BTC Transfer"})
				}
			}
			callback(txsToReturn.slice());
		} else if(response.statusCode == 404) {
			callback(0)
		} else {
			console.log(response.statusCode);
			callback(0);
		}
	})
}

function transferBitcoin(fromWIF, toAddress, amountInBTC, callback) {
	var amount = Math.round(amountInBTC * satoshisInBTC);
	var fromPair = bitcoin.ECPair.fromWIF(fromWIF);
	var tx = new bitcoin.TransactionBuilder();
	var totalBTC = 0;
	console.log(amountInBTC);
	console.log(amount);
	getUnspentBitcoinTXs(fromPair.getAddress(), function(txs){
		for(var i=0;i<txs.length;i++) {
			tx.addInput(txs[i].txid, txs[i].vout);
			totalBTC += Math.round(txs[i].amount * satoshisInBTC);
		}
		tx.addOutput(fromPair.getAddress(), totalBTC - amount - btcFee);
		tx.addOutput(toAddress, amount)
		for(var i=0;i<txs.length;i++) {
			tx.sign(i, fromPair)
		}
		request({
		    url:'http://btc.blockr.io/api/v1/tx/push',
		    method:"POST",
		    json: { hex: tx.build().toHex() }},
		    function (error, response, body) {
		        if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
		        	callback(body)
		        } else {
		        	console.log(error);
		        }
		    }
		)
	})
}

function getAdminBTCAddress(callback) {
	domain.dinarUser.findOne({
        role: "role_admin"
    }, function (err, adminObject) {
    	if(err) console.log("error is.."+err);
        if (!err && adminObject) {
        	callback(adminObject.bitcoinAddress);
        } else {
        	callback(false);
		}
	});
}
