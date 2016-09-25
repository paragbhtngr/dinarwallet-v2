exports.contract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getSmartXAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[],"name":"checkPermission","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"setActionManager","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getActionManager","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"getPermission","outputs":[{"name":"","type":"int256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"setSmartXAddress","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"GSCaddrs","type":"address[]"},{"name":"toAddr","type":"address"}],"name":"execute","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[{"name":"goldSmartContractBankAddress","type":"address"},{"name":"perm","type":"int256"}],"type":"constructor"}]
);

var data = '60606040526000600160146101000a81548160ff021916908302179055506040516040806107a3833981016040528080519060200190919080519060200190919050505b81600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550806002600050819055505b505061071a806100896000396000f36060604052361561007f576000357c01000000000000000000000000000000000000000000000000000000009004806305f474a8146100815780635a1c5830146100ba5780636b718db9146100df57806394a43e5c1461010d578063bddeab7714610146578063c174dce314610169578063dde1ee37146101975761007f565b005b61008e6004805050610209565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100c76004805050610238565b60405180821515815260200191505060405180910390f35b6100f5600480803590602001909190505061039c565b60405180821515815260200191505060405180910390f35b61011a60048050506103d7565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101536004805050610406565b6040518082815260200191505060405180910390f35b61017f6004808035906020019091905050610418565b60405180821515815260200191505060405180910390f35b6101f160048080359060200190820180359060200191919080806020026020016040519081016040528093929190818152602001838360200280828437820191505050505050909091908035906020019091905050610490565b60405180821515815260200191505060405180910390f35b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050610235565b90565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663cd143d45604051817c01000000000000000000000000000000000000000000000000000000000281526004018090506020604051808303816000876161da5a03f115610002575050506040518051906020015073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480156103925750600260005054600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ba061afa604051817c01000000000000000000000000000000000000000000000000000000000281526004018090506020604051808303816000876161da5a03f115610002575050506040518051906020015012155b9050610399565b90565b600081600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550600190506103d2565b919050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050610403565b90565b60006002600050549050610415565b90565b6000600160149054906101000a900460ff1615156104815781600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055506001600160146101000a81548160ff021916908302179055506001905061048b5661048a565b6000905061048b565b5b919050565b60006000600061049e610238565b1561070c5760019150600090505b84518110156107005781801561061b5750600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630ceed41c600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1687898681518110156100025790602001906020020151604051857c0100000000000000000000000000000000000000000000000000000000028152600401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1681526020019450505050506020604051808303816000876161da5a03f11561000257505050604051805190602001505b9150815084818151811015610002579060200190602002015173ffffffffffffffffffffffffffffffffffffffff1663ba45b0b8600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1686604051837c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff168152602001925050506000604051808303816000876161da5a03f115610002575050505b80806001019150506104ac565b81925061071256610711565b610002565b5b50509291505056';

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