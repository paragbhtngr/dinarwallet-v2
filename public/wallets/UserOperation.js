/*
This is used for user registration and object is required
ie {"user":{"user_name":"username","password":"password","email":"username@gmail.com"}}
*/
app.post("/api/v1/user/register", function (req, res, next) {
    console.log("Control in the user registration");
    var userData = req.body.user;
    if (userData) {
        domain.dinarUser.findOne({
        	email: userData.email
        }, function (err, userObject) {
        	console.log(userObject);
            if (userObject)
                view.successView(res, null, appMessage.error.userAlreadyRegister);
            else
                userRegistration(userData, res)
        })
    } else
        view.errorView(res, null, appMessage.error.invalidData, null)

});

var userRegistration = function (userObject, res) {
	console.log("registering User");
    var password = userObject.password;
    console.log("Password");
    if(isValidPassword(password)) {
    	console.log("aaa");
	    userObject.salt = uuid.v1();
	    var encryptedPassword = crypto.createHmac('sha1', userObject.salt).update(password).digest('hex')
	    userObject.password = encryptedPassword;
	    userObject.verification_token = uuid.v1();
	    var keyPair = bitcoin.ECPair.makeRandom();
	    userObject.bitcoinAddress = keyPair.getAddress();
	    userObject.wif = keyPair.toWIF();
	    
	    ethereum.createSmartX(function(smartXContract){
		    domain.dinarUser.findOneAndUpdate({email:userObject.email},{$set:{smartXAddress:smartXContract.address}},function (err, savedUserObject) {
		    });
	    })
	    
	    //REMOVE ONCE KYCAML IMPLEMENTED
	    userObject.KYCAML = true;
	    //REMOVE ONCE KYCAML IMPLEMENTED
	    
	    userObject.ethPass = crypto.randomBytes(64).toString('base64');
	    createEthereumAddress(userObject.ethPass, function(ethAddress) {
		    userObject.ethAddress = ethAddress;
		    console.log("mmmmm");
		    userObject.smartXAddress = "Pending";
		    var userRegistrationObject = new domain.dinarUser(userObject);
		    userRegistrationObject.save(function (err, savedUserObject) {
		    	console.log(err);
		    	console.log(savedUserObject);
		        if (!err) {
		            view.successView(res, savedUserObject, appMessage.success.userRegistration);
		            sendVerificatinLink(savedUserObject.verification_token, savedUserObject.email);
		        } else
		            view.errorView(res, err, appMessage.error.serverError, null)
		    });
	    })
	    
    } else {
	    view.errorView(res, err, "Password must have at least 1 letter, number, symbol and be at least 8 characters long", null)
    }
}

var sendVerificatinLink = function (verificationToken, toEmail) {
    console.log("Control in the send verification link");
    var link = "Click here to verify your email address " + Config.verfiyLink + verificationToken;
    EmailService.email(global.Config.email, toEmail, "Email Verification Link", link);
}

  /*
    API of user login
    {"email":"demo@gmail.com","password":"password"}
    if login is for admin then add one more field in the json
    {"email":"dinaradmin","password":"dinaradmin","role":"role_admin"}
    */
app.post("/api/v1/user/login", function (req, res, next) {
    console.log("Control in the user login");
    res.header('Access-Control-Allow-Origin', '*');
    if (req.body.email && req.body.password) {
        var role='role_user'
        if (req.body.role == 'role_admin') {
          role='role_admin';
        } 
        domain.dinarUser.findOne({
            email: req.body.email,
            role:role
        }, function (err, userObject) {
            if (userObject && verifyPassword(userObject, req.body.password)) {
                console.log("user is login")
                generateAuthToken(userObject, res)
            } else
                view.errorView(res, null, appMessage.error.invalidEmail, 401);
        })
    } else
        view.errorView(res, null, appMessage.error.invalidEmail, 401);
});

var verifyPassword = function (userObject, password) {
    var encryptedPassword = crypto.createHmac('sha1', userObject.salt).update(password).digest('hex')
    var passwordVerificationResult = (userObject.password == encryptedPassword) ? true : false
    return passwordVerificationResult
}

var generateAuthToken = function (user, res) {
    var authTokenObject = new domain.authToken({
        user: user._id,
        email: user.email,
        auth_token: uuid.v1()
    });
    domain.authToken.remove({email: user.email},function(err, removeObject) {
	    if(err) console.log("error is.."+err);
	    authTokenObject.save(function (err, authObject) {
	        if (!err)
	            view.successView(res, authObject, appMessage.success.loginSuccess);
	        else
	            view.errorView(res, err, appMessage.error.serverError, null);
	    });
    })
}

/*
API of logout the user 
the token is send in the x-auth-token
*/
app.get("/api/v1/user/logout", function (req, res) {
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    if (authToken) {
        domain.authToken.remove({
            auth_token: authToken
        }, function (err, removeObject) {
            console.log("error is.."+err);
            if (!err && removeObject) {
                view.successView(res, removeObject, appMessage.success.logoutSuccess);
            } else
                view.errorView(res, null, appMessage.error.invalidData, 401);
        });
    } else
        view.errorView(res, null, appMessage.error.invalidData, 401);
});
/*
API of verify the email 
*/
app.get("/api/v1/user/verify/:verifytoken", function (req, res) {
    var verifyToken = req.params.verifytoken;
    if (verifyToken) {
        domain.dinarUser.findOne({
            verification_token: verifyToken,
            user_deleted: false,
            is_email_verified: false
        }, function (err, userObject) {
            if (!err && userObject) {
                changeEmailVerificationStatus(userObject, res)
            } else
                view.errorView(res, null, appMessage.error.verifyLinkExpire, 401);
        });
    }
})

var changeEmailVerificationStatus = function (userObject, res) {
        domain.dinarUser.findOneAndUpdate({
            _id: userObject._id
        }, {
            is_email_verified: true
        }, {
            new: true
        }, function (err, userObject) {
            if (userObject)
                view.successView(res, null, appMessage.success.emailVerifed);
        })
    }
    /*
    API for send the link in case of forgot password
    */
app.post("/api/v1/user/forgotpassword", function (req, res) {
    console.log("Control in the forgot password", req.body.email);
    domain.dinarUser.findOne({
        email: req.body.email,
        user_deleted: false
    }, function (err, userObject) {
        if (userObject) {
            async.auto({
                "generateResetToken": function (next, result) {
                    return generateResetToken(userObject._id, next);
                },
                sendForgotPasswordEmail: ["generateResetToken", function (result, next) {
                     return sendForgotPasswordLink(result.generateResetToken.reset_password_token,result.generateResetToken.email, result.generateResetToken.user_name, next)
            }]
            }, function (err, result) {
                view.successView(res, null, appMessage.success.emailSent);
            })
        } else {
            view.successView(res, null, appMessage.error.emailNotExist);
        }
    });
});

var generateResetToken = function (userId, callback) {
    domain.dinarUser.findOneAndUpdate({
        _id: userId
    }, {
        reset_password_token: uuid.v1()
    }, {
        new: true
    }, function (err, userObject) {
        callback(null, userObject);
    })
}

var sendForgotPasswordLink = function (resetToken, toEmail, name, callback) {
        console.log("Control in the send verification link",name);
        var link = "Click here to reset your password " + Config.resetLink + name + "/" + resetToken;
        EmailService.email(global.Config.email, toEmail, "Forgot password Link", link);
        callback(null, appMessage.success.emailSent);
    }
    /*
    API for the reset the password 
    {"reset_token":"afafaer34afadf32","password":"password"}
    */
app.put("/api/v1/reset/password", function (req, res) {
    console.log("Control in the reset password",req.body.reset_token);
    var resetToken = req.body.reset_token;
    if (resetToken) {
        var salt = uuid.v1()
        var encryptedPassword = crypto.createHmac('sha1', salt).update(req.body.password).digest('hex');
        domain.dinarUser.findOneAndUpdate({
            reset_password_token: resetToken,
            user_deleted: false
        }, {
            reset_password_token: "",
            salt: salt,
            password: encryptedPassword
        }, function (err, userObject) {
            console.log(err,userObject)
            if (userObject) {
                view.successView(res, null, appMessage.success.passwordReset);
            } else{
                console.log("token expire")
                view.successView(res, null, appMessage.error.tokenExpire);
            }
        });
    } else
        view.successView(res, null, appMessage.success.tokenExpire);
});
/*
API is used for the show reset page when click on forgot password
*/
app.get("/api/v1/password/reset/:name/:token", function (req, res) {
    console.log("Control in the reset password");
    fs.readFile(publicDir + '/public/user/resetPassword.html', 'utf-8', function (error, content) {
        res.end(ejs.render(content, {
            resetPasswordLink: Config.resetPasswordApi
        }));
    })
})

app.post("/api/v1/user/buyDinar", function (req, res) {
    console.log("Control in the buy dinar", req.body.amt);
    console.log(req.body);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.KYCAML) {
	    		console.log("User Object")
	    		console.log(JSON.stringify(userObject));
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
		    		console.log("Contracts")
		    		console.log(contracts);
			    	getBitcoinBalance(userObject.bitcoinAddress, function(balance){
			    		console.log("Balance")
			    		balance*=satoshisInBTC;
			    		var amtInBTC = (req.body.amt * (quotes["GOLD_1DINAR"]["ask"]/btcInUSD));
						var amtInETH = (req.body.amt * (quotes["GOLD_1DINAR"]["ask"]/ethInUSD));
			    		console.log(balance);
			    		console.log(amtInBTC);
			    		console.log(amtInETH);
			    		checkBalance(req.body.btcOrETH, balance, amtInBTC, amtInETH, function(correctBalance){
			    			if(correctBalance) {
						    	var socket = require('socket.io-client')('http://nodejs.dinardirham.com:8484/');
						    	socket.on("response", function(result){
						    		if(result.result == 1) {
						    			console.log(result);
							    		var mt4OrdersObject = new domain.mt4Orders({id:result.data.order,amount:req.body.amt,type:"GOLD_1DINAR"});
							    		
							    		mt4OrdersObject.save(function (err, savedMt4OrdersObject) {
								    		if(err)console.log(err);
								    		console.log("USER OBJ");
								    		console.log(userObject);
								    		
								    		getAdminBTCAddress(function(adminAddress){
								    			getAdminETHAddress(function(adminETH) {
									    			console.log("admin");
									    			console.log(adminAddress);
									    			transferBTCorETH(req.body.btcOrETH, userObject, adminAddress, adminETH, amtInBTC, amtInETH, function(hash){
									    				console.log("HASH");
									    				console.log(hash);
									    				if(hash) {
									    					socket.close();
												    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Deposit DinarCoin", actionDeposit.contract.at(contracts["Deposit DinarCoin"]).execute.getData(Math.floor(req.body.amt*10000)), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
												    		console.log(executeResult)
												    		if(executeResult) {
												        		var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Buy DNC", amt:req.body.amt, ethHash:executeResult, otherHash:hash, btcOrETH:req.body.btcOrETH});
													    		domain.record.save(function(err, savedObj){
														    		res.send({"status":"success","hash":executeResult});
													    		})
												    		} else {
												        		view.errorView(res, null, appMessage.error.invalidData, 401);
												    		}
											    		} else {
											    			socket.emit('close.order', {order: result.data.order});
											    			socket.close();
											    			domain.mt4Orders.remove({id:result.data.order},function(){});
												    		view.errorView(res, null, appMessage.error.invalidData, 401);
											    		}
										    		})
									    		})
								    		})
							    		})
						    		} else {
							    		view.errorView(res, null, appMessage.error.invalidData, 401);
						    		}
						    	})
						    	socket.emit('open.order', {symbol: 'GOLD_1DINAR', volume:req.body.amt});
					    	} else {
					    		view.errorView(res, null, appMessage.error.invalidData, 401);
				    		}
				    	})
			    	})
		    	})
	    	} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/buyGSC", function (req, res) {
    console.log("Control in the buy GSC", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.KYCAML) {
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
			    	getBitcoinBalance(userObject.bitcoinAddress, function(balance){
			    		balance*=satoshisInBTC;
			    		var amtInBTC = (req.body.amt * (quotes["GOLD_1DINAR"]["ask"]/btcInUSD));
						var amtInETH = (req.body.amt * (quotes["GOLD_1DINAR"]["ask"]/ethInUSD));
			    		console.log(balance);
			    		console.log(amtInBTC);
			    		console.log(amtInETH);
			    		checkBalance(req.body.btcOrETH, balance, amtInBTC, amtInETH, function(correctBalance){
			    			if(correctBalance) {
						    	var socket = require('socket.io-client')('http://nodejs.dinardirham.com:8484/');
						    	socket.on("response", function(result){
						    		if(result.result == 1) {
							    		var mt4OrdersObject = new domain.mt4Orders({id:result.data.order,amount:req.body.amt,type:req.body.GSC});
							    		
							    		mt4OrdersObject.save(function (err, savedMt4OrdersObject) {
								    		if(err)console.log(err);
								    		console.log(userObject);
								    		
								    		getAdminBTCAddress(function(adminAddress){
								    			transferBTCorETH(req.body.btcOrETH, userObject, adminAddress, amtInETH, amtInBTC, amtInETH, function(hash){
								    				if(hash) {
								    					socket.close();
											    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Create Gold Smart Contract", actionCreateGoldSmartContract.contract.at(contracts["Create Gold Smart Contract"]).execute.getData(req.body.GSC,req.body.amt), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
											    		console.log(executeResult)
											    		if(executeResult) {
											    			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Buy GSC", amt:req.body.amt, ethHash:executeResult, otherHash:hash, btcOrETH:req.body.btcOrETH, gsc:req.body.GSC});
												    		domain.record.save(function(err, savedObj){
													    		res.send({"status":"success","hash":executeResult});
												    		})
											    		} else {
											        		view.errorView(res, null, appMessage.error.invalidData, 401);
											    		}
										    		} else {
										    			socket.emit('close.order', {order: result.data.order});
										    			domain.mt4Orders.remove({id:result.data.order},function(err){})
										    			socket.close();
											    		view.errorView(res, null, appMessage.error.invalidData, 401);
										    		}
									    		})
								    		})
							    		})
						    		} else {
							    		view.errorView(res, null, appMessage.error.invalidData, 401);
						    		}
						    	})
						    	socket.emit('open.order', {symbol: req.body.GSC, volume:req.body.amt});
					    	} else {
					    		view.errorView(res, null, appMessage.error.invalidData, 401);
				    		}
			    		})
			    	})
		    	})
	    	} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/sellGSC", function (req, res) {
    console.log("Control in the sell GSC", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
		if (userObject) {
			if(userObject.KYCAML) {
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
		        	console.log(userObject);
		    		console.log(req.body);
		    		var contracts = [];
		    		var GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, 0);
				    var i=1;
				    while(GSCAddress!="0x" && contracts.length < req.body.amt) {
				    	if(GSCAddress!="0x0000000000000000000000000000000000000000") {
					    	var GSC = ethereum.createContractFromAddress(goldSmartContract, GSCAddress);
					    	if(GSC.denomination() === req.body.GSC) {
						    	contracts.push(GSCAddress);
					    	}
						}
						GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, i);
						i++;
				    }
				    console.log(contracts);
				    if(contracts.length == req.body.amt) {
			    		getAdminSmartXAddress(function(adminSmartXAddress){
				    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Transfer Gold Smart Contracts", actionTransferGoldSmartContracts.contract.at(contracts["Transfer Gold Smart Contracts"]).execute.getData(contracts, adminSmartXAddress), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
				    		console.log(executeResult)
				    		if(executeResult) {
				    			var burnRequest = new domain.burnRequests({
					    			smartXAddress: userObject.smartXAddress,
					    			type: "GSC",
					    			gsc: req.body.GSC,
					    			contracts: contracts,
					    			btcOrETH: req.body.btcOrETH
				    			})
				    			if(req.body.btcOrETH === "BTC") {
					    			burnRequest.btcAmt = req.body.amt * quotes[req.body.GSC].bid/btcInUSD;
				    			} else if(req.body.btcOrETH === "ETH") {
				    				burnRequest.ethAmt = req.body.amt * quotes[req.body.GSC].bid/ethInUSD;
				    			}
				    			burnRequest.save(function(err, savedObj) {	
				    				var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Sell GSC Request", amt:req.body.amt, ethHash:executeResult, gsc:req.body.GSC});
						    		domain.record.save(function(err, savedObj){
							    		res.send({"status":"success","hash":executeResult});
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
    		} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/sellDinar", function (req, res) {
    console.log("Control in the sell dinar", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.KYCAML) {
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
		        	console.log(userObject);
		    		console.log(req.body);
		    		getAdminSmartXAddress(function(adminSmartXAddress){
			    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Transfer DinarCoin", actionTransfer.contract.at(contracts["Transfer DinarCoin"]).execute.getData(adminSmartXAddress,Math.floor(req.body.amt*10000)), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
			    		console.log(executeResult)
			    		if(executeResult) {
			        		var burnRequest = new domain.burnRequests({
				    			smartXAddress: userObject.smartXAddress,
				    			type: "DNC",
				    			amt: req.body.amt,
				    			btcOrETH: req.body.btcOrETH
			    			})
			    			if(req.body.btcOrETH === "BTC") {
				    			burnRequest.btcAmt = req.body.amt * quotes["GOLD_1DINAR"].bid/btcInUSD;
			    			} else if(req.body.btcOrETH === "ETH") {
			    				burnRequest.ethAmt = req.body.amt * quotes["GOLD_1DINAR"].bid/ethInUSD;
			    			}
			    			burnRequest.save(function(err, savedObj) {
			    				var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"Sell DNC Request", amt:req.body.amt, ethHash:executeResult});
					    		domain.record.save(function(err, savedObj){
						    		res.send({"status":"success","hash":executeResult});
					    		})
			    			})
			    		} else {
			        		view.errorView(res, null, appMessage.error.invalidData, 401);
			    		}
		    		})
	    		})
    		} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/transferDinar", function (req, res) {
    console.log("Control in the transfer dinar", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.KYCAML) {
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
		        	console.log(userObject);
		    		console.log(req.body);
		    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Transfer DinarCoin", actionTransfer.contract.at(contracts["Transfer DinarCoin"]).execute.getData(req.body.toAddress,Math.floor(req.body.amt*10000)), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
		    		console.log(executeResult)
		    		if(executeResult) {
		    			var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"DNC Transfer", amt:req.body.amt, ethHash:executeResult, otherAddress:req.body.toAddress});
			    		domain.record.save(function(err, savedObj){
				    		res.send({"status":"success","hash":executeResult});
			    		})
		    		} else {
		        		view.errorView(res, null, appMessage.error.invalidData, 401);
		    		}
	    		})
    		} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/transferGSC", function (req, res) {
    console.log("Control in the transfer dinar", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.KYCAML) {
		    	contractsFromSmartX(userObject.smartXAddress, function(contracts){
		        	console.log(userObject);
		    		console.log(req.body);
		    		var contracts = [];
		    		var GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, 0);
				    var i=1;
				    while(GSCAddress!="0x" && contracts.length < req.body.amt) {
				    	if(GSCAddress!="0x0000000000000000000000000000000000000000") {
					    	var GSC = ethereum.createContractFromAddress(goldSmartContract, GSCAddress);
					    	if(GSC.denomination() === req.body.GSC) {
						    	contracts.push(GSCAddress);
					    	}
						}
						GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, i);
						i++;
				    }
				    console.log(contracts);
				    if(contracts.length == req.body.amt) {
			    		var executeResult = actionManagerContract.execute(userObject.smartXAddress, "Transfer Gold Smart Contracts", actionTransferGoldSmartContracts.contract.at(contracts["Transfer Gold Smart Contracts"]).execute.getData(contracts, req.body.toAddress), (new Date()).getTime(), {from: web3.eth.defaultAccount, gas: 3000000});
			    		console.log(executeResult)
			    		if(executeResult) {
							var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"GSC Transfer", amt:req.body.amt, ethHash:executeResult, otherAddress:req.body.toAddress, gsc:req.body.GSC});
				    		domain.record.save(function(err, savedObj){
					    		res.send({"status":"success","hash":executeResult});
				    		})
			    		} else {
			        		view.errorView(res, null, appMessage.error.invalidData, 401);
			    		}
		    		} else {
			        	view.errorView(res, null, appMessage.error.invalidData, 401);
					}
	    		})
    		} else {
		    	view.errorView(res, null, appMessage.error.kycaml, 401);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/withdrawBTC", function (req, res) {
    console.log("Control in the transfer BTC", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	transferBitcoin(userObject.wif, req.body.address, req.body.amt, function(response){
	    		var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"BTC Withdraw", amt:req.body.amt, otherHash:response, btcOrETH:"BTC", otherAddress:req.body.address});
	    		domain.record.save(function(err, savedObj){
		    		res.send(response);
	    		})
	    	})
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/withdrawETH", function (req, res) {
    console.log("Control in the transfer ETH", req.body.amt);
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	transferEther(userObject.ethAddress, userObject.ethPass, req.body.address, req.body.amt, function(response){
		    	var record = new domain.record({smartXAddress:userObject.smartXAddress, type:"ETH Withdraw", amt:req.body.amt, otherHash:response, btcOrETH: "ETH", otherAddress:req.body.address});
	    		domain.record.save(function(err, savedObj){
		    		res.send(response);
	    		})
	    	})
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.post("/api/v1/user/updateKYCAML", function (req, res) {
    console.log("Control in the updateKYCAML");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.smartXAddress != "Pending") {
		    	if(req.body.KYCAML.firstName && req.body.KYCAML.lastName && req.body.KYCAML.phoneNumber && req.body.KYCAML.streetAddress && req.body.KYCAML.city && req.body.KYCAML.state && req.body.KYCAML.postalCode && req.body.KYCAML.phoneNumber && req.body.KYCAML.dob) {
		    		req.body.KYCAML.KYCAML = true;
		    		ethereum.createContractFromAddress(smartX, userObject.smartXAddress).setUserPermission(2);
		    	} else {
			    	req.body.KYCAML.KYCAML = false;
			    	ethereum.createContractFromAddress(smartX, userObject.smartXAddress).setUserPermission(0);
		    	}
		    	domain.dinarUser.findOneAndUpdate({email: userObject.email},{$set:req.body.KYCAML},function(err, updatedObject) {
			    	if(!err) {
				    	view.successView(res, null, "success");
			    	} else {
				    	view.errorView(res, null, appMessage.error.invalidData, 401);
			    	}
		    	})
	    	} else {
	    		view.errorView(res, null, "Please wait for your SmartX Address to be created", null);
	    	}
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.get("/api/v1/user/getKYCAML", function (req, res) {
    console.log("Control in the KYCAML");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	res.send({
	    		KYCAML: userObject.KYCAML?"Yes":"No",
		    	firstName: userObject.firstName,
		    	lastName: userObject.lastName,
		    	streetAddress: userObject.streetAddress,
		    	streetAddressTwo: userObject.streetAddressTwo,
		    	city: userObject.city,
		    	state: userObject.state,
		    	postalCode: userObject.postalCode,
		    	country: userObject.country,
		    	phoneNumber: userObject.phoneNumber,
		    	dob: userObject.dob
		    })
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

app.get("/api/v1/user/getReports", function (req, res) {
    console.log("Control in the Logs");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	domain.record.find({smartXAddress:userObject.smartXAddress}, {}, function(err, objs){
		    	res.send(objs);
	    	})
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

var openOrder = function(data, callback) {
    var params = {
        'login': masterLogin
    };
    var keys = ['symbol', 'volume'];
    for (var i in keys) params[keys[i]] = data[i];
    mt4Server.query('WebUserOpenOrder', params, function(ret){
        callback(ret);
    });
};

app.get("/api/v1/user/btcInUSD", function (req, res) {
	res.send({btcInUSD:btcInUSD});
})

app.get("/api/v1/user/ethInUSD", function (req, res) {
	res.send({ethInUSD:ethInUSD});
})

app.get("/api/v1/user/balances", function (req, res) {
    console.log("Control in the balances");
    console.log("*************************")
    var authToken = req.get('x-auth-token');
    console.log("authToken is ********pp"+authToken);
    isUser(authToken, function(userObject) {
	    if (userObject) {
	    	if(userObject.smartXAddress != "Pending") {
		    	var result = {smartXAddress:userObject.smartXAddress,
			        		dinar:goldBankContract.balanceOf(userObject.smartXAddress)/10000,
			        		bitcoinAddress:userObject.bitcoinAddress,
			        		ethAddress:userObject.ethAddress,
			        		ethBalance:web3.fromWei(web3.eth.getBalance(userObject.ethAddress))};
			    for(var i=0;i<GSCList.length;i++) {
				    result[GSCList[i]] = 0;
			    } 
			    var GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, 0);
			    var i=1;
			    //console.log(i);
			    //console.log(GSCAddress);
			    while(GSCAddress!="0x") {
			    	if(GSCAddress!="0x0000000000000000000000000000000000000000") {
				    	var GSC = ethereum.createContractFromAddress(goldSmartContract, GSCAddress);
				    	if(result[GSC.denomination()] || result[GSC.denomination()]==0) {
				    		//console.log(i);
							//console.log(GSCAddress);
					    	result[GSC.denomination()]++;
				    	}
				    }
				    GSCAddress = GSCBankContract.contractsOf(userObject.smartXAddress, i);
				    i++;
			    }
			    domain.burnRequests.find({smartXAddress:userObject.smartXAddress},"btcAmt ethAmt btcOrETH",function(err, burnRequests) {
			    	result.pendingBTC = 0;
			    	result.pendingETH = 0;
			    	for(var i=0;i<burnRequests.length;i++) {
			    		if(burnRequests.btcOrETH === "BTC") result.pendingBTC+=burnRequests[i].btcAmt;
			    		else if(burnRequests.btcOrETH === "ETH") result.pendingETH+=burnRequests[i].ethAmt;
			    	}
				    getBitcoinBalance(userObject.bitcoinAddress, function(balance){
					    if(balance || balance == 0) {
					    	result.bitcoinBalance = balance;
					    	res.send(result);
					    } else {
						    view.errorView(res, null, appMessage.error.invalidData, 401);
					    }
				    })
			    })
		    } else {
			    var result = {smartXAddress:userObject.smartXAddress,
			        		dinar:0,
			        		bitcoinAddress:userObject.bitcoinAddress,
			        		ethAddress:userObject.ethAddress,
			        		ethBalance:web3.fromWei(web3.eth.getBalance(userObject.ethAddress))};
			    for(var i=0;i<GSCList.length;i++) {
				    result[GSCList[i]] = 0;
			    } 
			    result.pendingBTC = 0;
			    res.send(result);
		    }
        } else {
        	view.errorView(res, null, appMessage.error.invalidData, 401);
		}
    })
});

function checkBalance(btcOrETH, balance, amtInBTC, amtInETH, callback) {
	if(btcOrETH === "BTC") {
		callback(balance >= amtInBTC);
	} else if(btcOrETH === "ETH") {
		callback(balance >= amtInETH);
	} else {
		callback(false);
	}
}

function contractsFromSmartX(smartXAddress, callback) {
	domain.contracts.find({smartXAddress:smartXAddress}, "name address", function(err, contracts){
		var rtn = {};
		for(var i=0;i<contracts.length;i++) {
			rtn[contracts[i].name] = contracts[i].address
		}
		callback(rtn);
	})
}

function transferBTCorETH(btcOrETH, userObject, toBTC, toETH, amtInBTC, amtInETH, callback) {
	console.log(btcOrETH, userObject, toBTC, toETH, amtInBTC, amtInETH);
	if(btcOrETH === "BTC") {
		transferBitcoin(userObject.wif, toBTC, amtInBTC, callback);
	} else if(btcOrETH === "ETH") {
		transferEther(userObject.ethAddress, userObject.ethPass, toETH, amtInETH, callback);
	} else {
		callback(false);
	}
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

function getAdminWIF(callback) {
	domain.dinarUser.findOne({
        role: "role_admin"
    }, function (err, adminObject) {
    	if(err) console.log("error is.."+err);
        if (!err && adminObject) {
        	callback(adminObject.wif)
        } else {
        	callback(false);
		}
	});
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

function getAdminSmartXAddress(callback) {
	domain.dinarUser.findOne({
        role: "role_admin"
    }, function (err, adminObject) {
    	if(err) console.log("error is.."+err);
        if (!err && adminObject) {
        	callback(adminObject.smartXAddress);
        } else {
        	callback(false);
		}
	});
}

function isValidPassword(password) {
	return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/);
}

function isUser(authToken, callback) {
	if (authToken) {
    	domain.authToken.findOne({
            auth_token: authToken
        }, function (err, authObject) {
        	if(err) console.log("error is.."+err);
            if (!err && authObject) {
            	domain.dinarUser.findOne({
		            email: authObject.email
		        }, function (err, userObject) {
		        	if(err) console.log("error is.."+err);
		            if (!err && userObject) {
		            	callback(userObject)
		            } else {
		            	callback(false);
					}
				});
            } else {
                callback(false);
            }
        });
    } else {
    	callback(false);
	}
}

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

//setTimeout(function(){transferEther("0xecf8A0244dDe015C3BDB53E8152070d957A3afA6", "Sme5hnxpXRMvkF4FInCdyZTLbsoMDfkCrvnmBDUvqzSv5uWbra9S4DmuaeJ1BmtzAr87VoFmtXTWQQBIHibQZ+EI3VbFog5OdDQ341Xe0PgK8ojuXUuIiSiqo9htWKkvb7D/tVRO6NfqtZNeIwhiSBsiz1xGyfl1oFpySDLNHN972C8OkBRoI9+/sTg//UCEnBtLZUT1KgRRJ1bWj2Hw+Lkdu1m5Tonvt73XCmA1rXfF240qlmjGP+qGkn6Fv/g1znTRtMfDCykhdvfhHTkIbE8My5FOADG04Jdoo8ueq6Bes2B2NErgL3cBTN+/lavGTUQvPjYlccxjQClr/7/vkw==", "0x5931512bd1e5340b1d7669d9dd1031f3c961cc5d", 0.01, function(res){console.log(res)})},1000);

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
