app.get("/api/v1/admin/ethereumAddresses", function (req, res) {
	console.log("Control in the ethereumAddresses");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isAdmin(authToken, function(adminObject){
	    if(adminObject) {
			res.send({
				actionManager:actionManagerContract.address,
				goldBank:goldBankContract.address,
				GSCBank:GSCBankContract.address
			})
		} else {
			view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
})

app.get("/api/v1/admin/getLogs", function (req, res) {
	console.log("Control in the getLogs");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isAdmin(authToken, function(adminObject){
	    if(adminObject) {
			var logs = [];
			var log;
			var i=0;
			var size = actionManagerContract.logSize();
			for(var i=0;i<size;i++) {
				logs.push(actionManagerContract.logs(i));
			}
			res.send(logs);
		} else {
			view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
})

app.get("/api/v1/admin/burnRequests", function (req, res) {
	console.log("Control in the burnRequests");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isAdmin(authToken, function(adminObject){
	    if(adminObject) {
	    	domain.burnRequests.find({},"type gsc amt btcAmt ethAmt btcOrETH contracts",function(err, burnRequests) {
		    	res.send(burnRequests);
	    	})
		} else {
			view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
})

app.post("/api/v1/admin/acceptBurnRequest", function (req, res) {
	if(req && req.body && req.body.id) {
		console.log("Control in the acceptBurnRequests");
	    console.log("*************************")
	    var authToken = req.get('x-auth-token');
	    console.log("authToken is ********pp"+authToken);
	    isAdmin(authToken, function(adminObject){
		    if(adminObject) {
		    	contractsFromSmartX(adminObject.smartXAddress, function(contracts) {
			    	domain.burnRequests.findOne({_id:req.body.id},{},function(err, burnRequest) {
			    		domain.dinarUser.findOne({smartXAddress:burnRequest.smartXAddress},"bitcoinAddress",function(err, userObject){
			    			console.log(userObject);
			    			var amt = 0;
			    			var type = "";
			    			var contracts = []
			    			if(burnRequest.type === "DNC") {
			    				amt = burnRequest.amt;
			    				type = "GOLD_1DINAR";
			    				
			    			} else if(burnRequest.type === "GSC") {
			    				console.log("CONTRACTS");
			    				contracts = burnRequest.contracts.split(",");
			    				console.log(contracts);
				    			amt = contracts.length;
				    			type = ethereum.createContractFromAddress(goldSmartContract, contracts[0]).denomination();
			    			}
			    			domain.mt4Orders.find({$or:[{type:type},{gsc:type}]},{},function(err, mt4Orders) {
			    				var socket = require('socket.io-client')('http://nodejs.dinardirham.com:8484/');
			    				var i=0;
			    				console.log(mt4Orders);
			    				while(amt>0) {
			    					console.log(amt);
			    					console.log(i);
			    					socket.emit('close.order', {order: mt4Orders[i].id});
			    					amt-=mt4Orders[i].amount;
			    					(function(i){
					    				domain.mt4Orders.remove({_id:mt4Orders[i]._id},function(err){
						    				
					    				})
				    				})(i)
				    				i++;
			    				}
			    				if(amt<0) {
			    					socket.emit('open.order', {symbol:type, volume: -amt});
			    					socket.on("response", function(result){
			    						console.log(result);
			    						if(result.event === 'open.order') {
				    						socket.close();
				    						var mt4OrdersObject = new domain.mt4Orders({id:result.data.order,amount:-amt,type:type});
								    		
								    		mt4OrdersObject.save(function (err, savedMt4OrdersObject) {
								    			
								    		})
							    		}
							    	})
			    				} else {
				    				socket.close();
			    				}
			    			})
			    			if(userObject) {
						    	if(burnRequest.type === "DNC") {
						    		actionManagerContract.execute(adminObject.smartXAddress, "Withdraw DinarCoin", actionWithdraw.contract.at(contracts["Withdraw DinarCoin"]).execute.getData(Math.floor(burnRequest.amt*10000)), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000}, function(err, executeResult){
							    		if(executeResult) {
							    			if(burnRequest.btcOrETH == "BTC") {
							    				console.log("BTC Burn Accept")
							    				console.log(adminObject.wif, userObject.bitcoinAddress, burnRequest.btcAmt);
									    		transferBitcoin(adminObject.wif, userObject.bitcoinAddress, burnRequest.btcAmt, function(hash) {
									    			if(hash&&hash.data)hash=hash.data;
										    		domain.burnRequests.remove({_id:req.body.id}, function(err){
									        			if(err)console.log(err);
									        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Accept DNC Burn Request", amt:burnRequest.amt, ethHash:executeResult, otherHash:hash, btcOrETH:"BTC"});
											    		domain.record.save(function(err, savedObj){
												    		res.send({"status":"success","hash":executeResult});
											    		})
									        		})
									    		})
								    		} else if(burnRequest.btcOrETH == "ETH") {
								    			console.log("ETH Burn Accept")
							    				console.log(adminObject.ethAddress, adminObject.ethPassword, userObject.ethAddress, burnRequest.ethAmt);
									    		transferEther(adminObject.ethAddress, adminObject.ethPassword, userObject.ethAddress, burnRequest.ethAmt, function(hash) {
										    		domain.burnRequests.remove({_id:req.body.id}, function(err){
									        			if(err)console.log(err);
									        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Accept DNC Burn Request", amt:burnRequest.amt, ethHash:executeResult, otherHash:hash, btcOrETH:"ETH"});
											    		domain.record.save(function(err, savedObj){
												    		res.send({"status":"success","hash":executeResult});
											    		})
									        		})
									    		})
								    		}
							    		} else {
							        		view.errorView(res, null, appMessage.error.invalidData, 401);
							    		}
						    		});
						    	} else if(burnRequest.type === "GSC") {
						    		actionManagerContract.execute(adminObject.smartXAddress, "Destroy Gold Smart Contracts", actionDestroyGoldSmartContracts.contract.at(contracts["Destroy Gold Smart Contracts"]).execute.getData(contracts, "0x0000000000000000000000000000000000000000"), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000}, function(err, executeResult){
							    		if(executeResult) {
							    			if(burnRequest.btcOrETH == "BTC") {
							    				console.log("BTC Burn Accept")
							    				console.log(adminObject.wif, userObject.bitcoinAddress, burnRequest.btcAmt);
									    		transferBitcoin(adminObject.wif, userObject.bitcoinAddress, burnRequest.btcAmt, function(hash) {
									    			if(hash&&hash.data)hash=hash.data;
										    		domain.burnRequests.remove({_id:req.body.id}, function(err){
									        			if(err)console.log(err);
									        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Accept GSC Burn Request", amt:contracts.length, ethHash:executeResult, otherHash:hash, btcOrETH:"BTC"});
											    		domain.record.save(function(err, savedObj){
												    		res.send({"status":"success","hash":executeResult});
											    		})
									        		})
									    		})
								    		} else if(burnRequest.btcOrETH == "ETH") {
								    			console.log("ETH Burn Accept")
							    				console.log(adminObject.ethAddress, adminObject.ethPassword, userObject.ethAddress, burnRequest.ethAmt);
									    		transferEther(adminObject.ethAddress, adminObject.ethPassword, userObject.ethAddress, burnRequest.ethAmt, function(hash) {
										    		domain.burnRequests.remove({_id:req.body.id}, function(err){
									        			if(err)console.log(err);
									        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Accept GSC Burn Request", amt:contracts.length, ethHash:executeResult, otherHash:hash, btcOrETH:"ETH"});
											    		domain.record.save(function(err, savedObj){
												    		res.send({"status":"success","hash":executeResult});
											    		})
									        		})
									    		})
								    		}
							    		} else {
							        		view.errorView(res, null, appMessage.error.invalidData, 401);
							    		}
						    		});
						    	} else {
							    	view.errorView(res, null, appMessage.error.invalidData, 401);
						    	}
					    	} else {
						    	view.errorView(res, null, appMessage.error.invalidData, 401);
					    	}
				    	})
			    	})
		    	})
			} else {
				view.errorView(res, null, appMessage.error.invalidData, 401);
			}
	    })
    } else {
		view.errorView(res, null, appMessage.error.invalidData, 401);
	}
})

function transferBitcoin(fromWIF, toAddress, amountInBTC, callback) {
	var amount = Math.round(amountInBTC * satoshisInBTC);
	var fromPair = bitcoin.ECPair.fromWIF(fromWIF);
	var tx = new bitcoin.TransactionBuilder();
	var totalBTC = 0;
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

function getUnspentBitcoinTXs(address, callback) {
	request('https://blockexplorer.com/api/addr/'+address+'/utxo?noCache=1', function (error, response, body) {
		if (!error && response.statusCode == 200 && JSON.parse(body) ) {
	    	callback(JSON.parse(body))
		} else {
			console.log(response.statusCode);
			callback(false)
		}
	})
}

app.post("/api/v1/admin/rejectBurnRequest", function (req, res) {
	if(req && req.body && req.body.id) {
		console.log("Control in the rejectBurnRequests");
	    console.log("*************************")
	    var authToken = req.get('x-auth-token');
	    console.log("authToken is ********pp"+authToken);
	    isAdmin(authToken, function(adminObject){
		    if(adminObject) {
		    	contractsFromSmartX(adminObject.smartXAddress, function(contracts) {
			    	domain.burnRequests.findOne({_id:req.body.id},{},function(err, burnRequest) {
				    	if(burnRequest.type === "DNC") {
					    	actionManagerContract.execute(adminObject.smartXAddress, "Transfer DinarCoin", actionTransfer.contract.at(contracts["Transfer DinarCoin"]).execute.getData(burnRequest.smartXAddress,Math.floor(burnRequest.amt*10000)), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000}, function(err, executeResult){
					    		console.log(executeResult)
					    		if(executeResult) {
					    			domain.burnRequests.remove({_id:req.body.id}, function(err){
					        			if(err)console.log(err);
					        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Reject DNC Burn Request", amt:burnRequest.amt, ethHash:executeResult});
							    		domain.record.save(function(err, savedObj){
								    		res.send({"status":"success","hash":executeResult});
							    		})
					        		})
					    		} else {
					        		view.errorView(res, null, appMessage.error.invalidData, 401);
					    		}
				    		});
				    	} else if(burnRequest.type === "GSC") {
					    	actionManagerContract.execute(adminObject.smartXAddress, "Transfer Gold Smart Contracts", actionTransferGoldSmartContracts.contract.at(contracts["Transfer Gold Smart Contracts"]).execute.getData(burnRequest.contracts.split(","), burnRequest.smartXAddress), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000}, function(err, executeResult){
					    		console.log(executeResult)
					    		if(executeResult) {
					        		domain.burnRequests.remove({_id:req.body.id}, function(err){
					        			if(err)console.log(err);
					        			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Reject GSC Burn Request", amt:burnRequest.contracts.split(",").length, ethHash:executeResult});
							    		domain.record.save(function(err, savedObj){
								    		res.send({"status":"success","hash":executeResult});
							    		})
					        		})
					    		} else {
					        		view.errorView(res, null, appMessage.error.invalidData, 401);
					    		}
				    		});
				    	} else {
					    	view.errorView(res, null, appMessage.error.invalidData, 401);
				    	}
			    	})
		    	})
			} else {
				view.errorView(res, null, appMessage.error.invalidData, 401);
			}
	    })
    } else {
		view.errorView(res, null, appMessage.error.invalidData, 401);
	}
})

function contractsFromSmartX(smartXAddress, callback) {
	domain.contracts.find({smartXAddress:smartXAddress}, "name address", function(err, contracts){
		var rtn = {};
		for(var i=0;i<contracts.length;i++) {
			rtn[contracts[i].name] = contracts[i].address
		}
		callback(rtn);
	})
}

app.get("/api/v1/admin/balances", function (req, res) {
	console.log("Control in the getBalances");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isAdmin(authToken, function(adminObject){
	    if(adminObject) {
			domain.dinarUser.find({role:"role_user"},"smartXAddress",function(err, users){
				balances = [];
				for(var i=0;i<users.length;i++) {
					if(users[i].smartXAddress!="Pending") {
						balances[i] = {smartXAddress:users[i].smartXAddress};
						balances[i].dinar = goldBankContract.balanceOf(users[i].smartXAddress)/10000
					    for(var j=0;j<GSCList.length;j++) {
						    balances[i][GSCList[j]] = 0;
					    } 
					    var GSCAddress = GSCBankContract.contractsOf(users[i].smartXAddress, 0);
					    var j=1;
					    console.log(j);
					    console.log(GSCAddress);
					    while(GSCAddress!="0x") {
					    	if(GSCAddress!="0x0000000000000000000000000000000000000000") {
						    	var GSC = ethereum.createContractFromAddress(goldSmartContract, GSCAddress);
						    	if(balances[i][GSC.denomination()] || balances[i][GSC.denomination()]==0) {
						    		console.log(j);
									console.log(GSCAddress);
							    	balances[i][GSC.denomination()]++;
						    	}
						    }
						    GSCAddress = GSCBankContract.contractsOf(users[i].smartXAddress, j);
						    j++;
					    }
				    } else {
					    users.splice(i, 1);
					    i--;
				    }
				}
				res.send(balances);
			})
		} else {
			view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
})

function isAdmin(authToken, callback) {
	if (authToken) {
        domain.authToken.findOne({
            auth_token: authToken
        }, function (err, authObject) {
			if(err) console.log("error is.."+err);
            if (!err && authObject) {
            	domain.dinarUser.findOne({
		            email: authObject.email,
					role: "role_admin"
		        }, function (err, adminObject) {
		        	callback(adminObject);
				})
			} else {
				callback(false);
			}
		})
	} else {
		callback(false);
	}
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
				callback({status:"success",hash:web3.eth.sendTransaction({from: from, to: to, value: web3.toWei(amtOfEther, "ether")})})
			} catch(e) {
				callback({status:"fail",error:e});
			}
		} else {
			callback(false);
		}
	})
}

//setTimeout(function(){transferBitcoin("L1TyBdFtZTucdwBUm2YyoXsDHjM8zW5gwDunmH6KgDXkdGLSLShT", "16dDekQyP3VVU7TxRytdK9gV7vvRdeqwyY", 0.379215, function(){})},1000);