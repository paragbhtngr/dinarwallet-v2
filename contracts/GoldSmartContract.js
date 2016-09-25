exports.contract = web3.eth.contract([{"constant":false,"inputs":[{"name":"smartXAddress","type":"address"}],"name":"destroyContract","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"smartXAddress","type":"address"},{"name":"addr","type":"address"}],"name":"validate","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getContractAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"denomination","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"smartXAddress","type":"address"},{"name":"recipient","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"inputs":[{"name":"smartXAddress","type":"address"},{"name":"contractDenomination","type":"string"},{"name":"contractOwner","type":"address"}],"type":"constructor"}]
);

var data = '60606040526040516103eb3803806103eb83398101604052805160805160a0519192019061009a8333600082600160a060020a031663207c64fb83604051827c01000000000000000000000000000000000000000000000000000000000281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f11561000257505060405151949350505050565b15156100a557610002565b8160006000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061010b57805160ff19168380011785555b5061013b9291505b8082111561016c578381556001016100f8565b828001600101855582156100f0579182015b828111156100f057825182600050559160200191906001019061011d565b505080600160006101000a815481600160a060020a030219169083021790555050505061027b806101706000396000f35b509056606060405236156100565760e060020a6000350463016a37388114610058578063221e2efc1461006857806332a2c5d0146100cb5780638bca6d16146100ea5780638da5cb5b1461014a578063ba45b0b81461015c575b005b6100566004356101ef8133610072565b61016f6004356024355b600082600160a060020a031663207c64fb836040518260e060020a0281526004018082600160a060020a031681526020019150506020604051808303816000876161da5a03f11561000257505060405151949350505050565b305b60408051600160a060020a03929092168252519081900360200190f35b61018160008054604080516020601f600260001960018716156101000201909516949094049384018190048102820181019092528281529291908301828280156102455780601f1061021a57610100808354040283529160200191610245565b6100cd600154600160a060020a031681565b61005660043560243561024d8233610072565b60408051918252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156101e15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b15156101fa57610002565b6001805473ffffffffffffffffffffffffffffffffffffffff1916905550565b820191906000526020600020905b81548152906001019060200180831161022857829003601f168201915b505050505081565b151561025857610002565b6001805473ffffffffffffffffffffffffffffffffffffffff191682179055505056';