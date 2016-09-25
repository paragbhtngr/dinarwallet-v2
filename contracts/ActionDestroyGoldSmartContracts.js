exports.contract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getSmartXAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"GSCaddrs","type":"address[]"}],"name":"execute","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"checkPermission","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"setActionManager","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getActionManager","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"getPermission","outputs":[{"name":"","type":"int256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"setSmartXAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[{"name":"goldSmartContractBankAddress","type":"address"},{"name":"perm","type":"int256"}],"type":"constructor"}]
);

var data = '60606040526000600160146101000a81548160ff0219169083021790555060405160408061075d833981016040528080519060200190919080519060200190919050505b81600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550806002600050819055505b50506106d4806100896000396000f36060604052361561007f576000357c01000000000000000000000000000000000000000000000000000000009004806305f474a8146100815780634c0a0dfa146100ba5780635a1c5830146101235780636b718db91461014857806394a43e5c14610176578063bddeab77146101af578063c174dce3146101d25761007f565b005b61008e6004805050610200565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61010b6004808035906020019082018035906020019191908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505090909190505061022f565b60405180821515815260200191505060405180910390f35b610130600480505061047c565b60405180821515815260200191505060405180910390f35b61015e60048080359060200190919050506105e0565b60405180821515815260200191505060405180910390f35b610183600480505061061b565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101bc600480505061064a565b6040518082815260200191505060405180910390f35b6101e8600480803590602001909190505061065c565b60405180821515815260200191505060405180910390f35b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905061022c565b90565b60006000600061023d61047c565b1561046f5760009150600090505b83518110156104635781801561039c5750600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639a9bed58600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16878581518110156100025790602001906020020151604051847c0100000000000000000000000000000000000000000000000000000000028152600401808473ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff16815260200193505050506020604051808303816000876161da5a03f11561000257505050604051805190602001505b9150815083818151811015610002579060200190602002015173ffffffffffffffffffffffffffffffffffffffff1663016a3738600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051827c0100000000000000000000000000000000000000000000000000000000028152600401808273ffffffffffffffffffffffffffffffffffffffff1681526020019150506000604051808303816000876161da5a03f115610002575050505b808060010191505061024b565b81925061047556610474565b610002565b5b5050919050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663cd143d45604051817c01000000000000000000000000000000000000000000000000000000000281526004018090506020604051808303816000876161da5a03f115610002575050506040518051906020015073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480156105d65750600260005054600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ba061afa604051817c01000000000000000000000000000000000000000000000000000000000281526004018090506020604051808303816000876161da5a03f115610002575050506040518051906020015012155b90506105dd565b90565b600081600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555060019050610616565b919050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050610647565b90565b60006002600050549050610659565b90565b6000600160149054906101000a900460ff1615156106c55781600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055506001600160146101000a81548160ff02191690830217905550600190506106cf566106ce565b600090506106cf565b5b91905056';

exports.createContract = function(goldSmartContractBankAddress, perm, callback) {
	exports.contract.new(goldSmartContractBankAddress, perm,
		{
			from: web3.eth.defaultAccount, 
			data: data,
			gas: 3000000
		}, function(e, minedContract){
			if (typeof minedContract.address != 'undefined') {
				//console.log('Contract mined! address: ' + minedContract.address + ' transactionHash: ' + minedContract.transactionHash);
				if(callback) callback(minedContract);
			} else if(e) {
				console.log("Contract Error");
				console.log(e);
			}
		}
	)
}