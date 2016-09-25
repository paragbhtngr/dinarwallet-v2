var exports = module.exports = {};


function createEthereumAddress(password, callback) {
	request.post('http://localhost:8545', {form:'{"jsonrpc":"2.0","method":"personal_newAccount","params":["' + password + '"],"id":74}'}, function(error, response, body){
		console.log(body);
		if(body && JSON.parse(body).result) {
			callback(JSON.parse(body).result)
		} else {
			callback(false);
		}
	})
}

function getIncomingEther(address, callback) {
	request('http://api.etherscan.io/api?module=account&action=txlist&address='+address, function (error, response, body) {
		if (response.statusCode == 200 ) {
			console.log(JSON.parse(body));
			var txs = JSON.parse(body).result;
			var txsToReturn = [];
			for(var i=0;i<txs.length;i++) {
				//if(txs[i].to == address) {
					txsToReturn.push({"createdAt":parseInt(txs[i].timeStamp)*1000,"hash":txs[i].hash,"confirmations":txs[i].confirmations, "from":txs[i].from,"to":txs[i].to,"amt":web3.fromWei(txs[i].value),"btcOrETH":"ETH","type":"ETH Transfer"})
				//}
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

function transferEther(from, fromPassword, to, amtOfEther, callback) {
	console.log(from, fromPassword, to, amtOfEther);
	request.post('http://localhost:8545', {form:'{"jsonrpc":"2.0","method":"personal_unlockAccount","params":["' + from + '","' + fromPassword + '",' + 10 + '],"id":74}'}, function(error, response, body){
		console.log("error")
		console.log(error)
		console.log("response")
		console.log(response)
		console.log("body");
		console.log(body);
		if(body && JSON.parse(body).result) {
			try {
				callback(web3.eth.sendTransaction({from: from, to: to, value: web3.toWei(amtOfEther, "ether")}))
			} catch(e) {
				console.log(e);
				callback({status:"fail",error:e});
			}
		} else {
			callback(false);
		}
	})
}


function getAdminETHAddress(callback) {
	domain.dinarUser.findOne({
        role: "role_admin"
    }, function (err, adminObject) {
    	if(err) console.log("error is.."+err);
        if (!err && adminObject) {
        	callback(adminObject.ethAddress);
        } else {
        	callback(false);
		}
	});
}
