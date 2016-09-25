web3.setProvider(new web3.providers.HttpProvider('http://localhost:80'));

web3.eth.defaultAccount = "0xe9eeaec75883f0e389a78e2260bfac1776df2f1d" || web3.eth.accounts[0];

//If the ethereum address you are using isn't the first one, put the address in the quotation marks. If blank, it will use the first ethereum address.
//web3.eth.defaultAccount = "" || web3.eth.accounts[0]

web3.eth.defaultBlock = "pending";

exports.createContractFromAddress = function(contract, address) {
	//console.log("CONTRACT: " + JSON.stringify(contract));
	//console.log("ADDRESS: " + address);
	return contract.contract.at(address);
}

exports.finishedSetup = false;

var createActionManager = function(callback) {
	domain.contracts.find({name:"ActionManager"}, "address", function(err, actionManagerResult){
		if(actionManagerResult.length==0) {
			actionManager.createContract(function(actionManagerContract) {
				var contractsObject=new domain.contracts({name:"ActionManager",address:actionManagerContract.address, hash:actionManagerContract.transactionHash});
				contractsObject.save(function(err,result){
			        callback(actionManagerContract);
			    });
			});
		} else {
			callback(exports.createContractFromAddress(actionManager, actionManagerResult[0].address));
		}
	})
}

exports.createSmartX = function(callback) {
	if(exports.finishedSetup) {
		var actionManagerAddress = actionManagerContract.address;
		smartX.createContract(actionManagerAddress, function(smartXContract){
			//REMOVE WHEN KYCAML DONE
			smartXContract.setUserPermission(2);
			//REMOVE WHEN KYCAML DONE
			var contractsObject=new domain.contracts({name:"SmartX",address:smartXContract.address, hash:smartXContract.transactionHash});
			createActions(smartXContract, function(){
				contractsObject.save(function(err,result){
			        callback(smartXContract);
			    });
		    });
		});
	} else {
		setTimeout(function(){exports.createSmartX(callback)}, 1000)
	}
}

var createGoldBank = function(tokenName, tokenSymbol, tokenDecimals, callback) {
	domain.contracts.find({name:"GoldBank"}, "address", function(err, goldBankResult){
		if(goldBankResult.length==0) {
			goldBank.createContract(tokenName, tokenSymbol, tokenDecimals, function(goldBankContract){
				var contractsObject=new domain.contracts({name:"GoldBank",address:goldBankContract.address, hash:goldBankContract.transactionHash});
				contractsObject.save(function(err,result){
			        callback(goldBankContract);
			    });
			});
		} else {
			callback(exports.createContractFromAddress(goldBank, goldBankResult[0].address));
		}
	})
}

var createGSCBank = function(callback) {
	domain.contracts.find({name:"GSCBank"}, "address", function(err, GSCBankResult){
		if(GSCBankResult.length==0) {
			goldSmartContractBank.createContract(function(GSCContract){
				var contractsObject=new domain.contracts({name:"GSCBank",address:GSCContract.address, hash:GSCContract.transactionHash});
				contractsObject.save(function(err,result){
			        callback(GSCContract);
			    });
			});
		} else {
			callback(exports.createContractFromAddress(goldSmartContractBank, GSCBankResult[0].address));
		}
	})
}

var createActions = function(smartXContract, callback) {
	var actionKeys = Object.keys(actions);
	var actionCount = actionKeys.length;

	for(var i=0;i<actionKeys.length;i++) {
		(function(i) {
			actions[actionKeys[i]].execute(function(contract){
				smartXContract.addAction(actions[actionKeys[i]].name, contract.address, {from: web3.eth.defaultAccount, gas: 3000000});
				var contractsObject=new domain.contracts({name: actions[actionKeys[i]].name,address:contract.address, hash:contract.transactionHash, smartXAddress: smartXContract.address});
				contractsObject.save(function(err,result){
					actionCount--;
					if(actionCount == 0) {
						callback();
					}
				});
			})
		})(i)
	}
}

createActionManager(function(amc){
	global.actionManagerContract = amc;
	createGoldBank("Dinar", "D", 4, function(gbc) {
		global.goldBankContract = gbc;
		createGSCBank(function(gscbc){
			global.GSCBankContract = gscbc;
			console.log("Ethereum Setup Done")
			console.log("Action Manager Address: " + actionManagerContract.address);
			console.log("Gold Bank Address: " + goldBankContract.address);
			console.log("GSC Bank Address: " + GSCBankContract.address);
			global.actions = [
				{execute:function(callback){actionDeposit.createContract(goldBankContract.address, 2, callback)}, name:"Deposit DinarCoin"},
				{execute:function(callback){actionWithdraw.createContract(goldBankContract.address, 2, callback)}, name:"Withdraw DinarCoin"},
				{execute:function(callback){actionTransfer.createContract(goldBankContract.address, 2, callback)}, name:"Transfer DinarCoin"},
				{execute:function(callback){actionCreateGoldSmartContract.createContract(GSCBankContract.address, 2, callback)}, name:"Create Gold Smart Contract"},
				{execute:function(callback){actionDestroyGoldSmartContracts.createContract(GSCBankContract.address, 2, callback)}, name:"Destroy Gold Smart Contracts"},
				/*{execute:function(callback){actionDestroyGoldSmartContracts.createContract(GSCBankContract.address, 2, callback)}, name:"Destroy Gold Smart Contracts"},*/
				{execute:function(callback){actionTransferGoldSmartContracts.createContract(GSCBankContract.address, 2, callback)}, name:"Transfer Gold Smart Contracts"}
			];
			exports.finishedSetup = true;
		})
	})
})
