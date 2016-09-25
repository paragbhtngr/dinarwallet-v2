contract ActionManagerUser {
    
    address actionManager;
    
    function setActionManager(address addr) returns (bool) {
        actionManager = addr;
        return true;
    }
    
    function getActionManager() constant returns (address) {
        return actionManager;
    }
}

contract SmartXUser is ActionManagerUser {
    
    address smartXAddress;
    bool smartXAddressSet = false;
    
    function setSmartXAddress(address addr) returns (bool) {
        if(!smartXAddressSet) {
            smartXAddress = addr;
            smartXAddressSet = true;
            return true;
        } else {
            return false;
        }
    }
    
    function getSmartXAddress() constant returns (address) {
        return smartXAddress;
    }
}

contract Action is ActionManagerUser, SmartXUser {
    
    int permission;
    
    function getPermission() constant returns (int) {
        return permission;
    }
    
    function checkPermission() returns (bool) {
        return msg.sender==SmartX(smartXAddress).getActionDataAddress() && SmartX(smartXAddress).getUserPermission() >= permission;
    }
}

contract ActionData {
    mapping (string => address) actions;
	
	mapping (address => bool) addresses;
	
	address smartXAddress;
	address actionManagerAddress;
	
	function ActionData(address smartx, address actionManager) {
	    smartXAddress = smartx;
	    actionManagerAddress = actionManager;
	}
	
	function checkAddress(address addr) constant returns (bool) {
	    return addr == smartXAddress;
	}
	
	function addAction(string name, address addr) returns (bool) {
		if(checkAddress(msg.sender)) {
    		actions[name] = addr;
    		addresses[addr] = true;
    		ActionManagerUser(addr).setActionManager(actionManagerAddress);
    		return Action(addr).setSmartXAddress(smartXAddress);
		} else {
		    throw;
		}
	}
	
	function removeAction(string name)returns (bool) {
		if(checkAddress(msg.sender)) {
    		address actn = actions[name];
    		if (actn == 0x0){
    		  return false;
    		}
    		actions[name] = 0x0;
    		addresses[actn] = true;
    		return true;
		} else {
		    throw;
		}
	}
	
	function validate(address addr) constant returns (bool) {
	    if(checkAddress(msg.sender)) {
    	    if(addresses[addr] == true){
    			return true;
    		}
    		return false;
	    } else {
		    throw;
		}
	}
	
	function execute(string actionName, bytes data) returns (bool) {
		if(checkAddress(msg.sender)) {
    		address actn = actions[actionName];
    		if (actn == 0x0){
    			return false;
    		}
    		if ( Action(actn).getPermission() < SmartX(Action(actn).getSmartXAddress()).getUserPermission() ) {
    		    return false;
    		}
    		return actn.call(data);
		} else {
		    throw;
		}
	}
	
	function getAddress() constant returns(address) {
	    return this;
	}
}

contract SmartX {
    int permission;
    
    ActionData actionData;
    
    address actionManager;
    address admin;
    
    function SmartX(address actionManagerAddress) {
        actionManager = actionManagerAddress;
        admin = msg.sender;
        actionData = new ActionData(this, actionManager);
    }
    
    function addAction(string name, address action) returns (bool) {
        if(msg.sender == admin) {
            return actionData.addAction(name, action);
        } else {
	        throw;
	    }
    }
    
    function removeAction(string name) returns (bool) {
        if(msg.sender == admin) {
            return actionData.removeAction(name);
        } else {
	        throw;
	    }
    }
    
    function validate(address addr) constant returns (bool) {
	    return actionData.validate(addr);
	}
	
	function execute(string actionName, bytes data) returns (bool) {
	    if(msg.sender == actionManager) {
		    return actionData.execute(actionName, data);
	    } else {
	        throw;
	    }
	}
	
	function setUserPermission(int perm) returns (bool) {
	    if(msg.sender == admin) {
	        permission = perm;
	        return true;
	    } else {
	        throw;
	    }
	}
	
	function getUserPermission() constant returns (int) {
	    return permission;
	}
	
	function getActionDataAddress() constant returns (address) {
	    return actionData.getAddress();
	}
    
}

contract Validee {
    function validate(address smartXAddress, address addr) returns (bool) {
        return SmartX(smartXAddress).validate(addr);
    }
}

contract ActionManager {
	
	bool logging = true;
	
	struct Log {
	    address smartXAddress;
	    string actionName;
	    bytes data;
	    uint date;
	}
	
	Log[] public logs;
	uint256 public logSize = 0;
	
	address admin;
	
	function ActionManager() {
	    admin = msg.sender;
	}
	
	function setLogging(bool b) returns (bool) {
	    logging = b;
	    return true;
	}
	
	function log(Log l) private {
	    logs.push(l);
	    logSize++;
	}
	
	function execute(address smartXAddress, string actionName, bytes data, uint date) returns (bool) {
        if(msg.sender==admin) {
        	if(SmartX(smartXAddress).execute(actionName, data)) {
        	    if(logging) {        	    
                    Log memory l;
            		l.smartXAddress = smartXAddress;
            		l.actionName = actionName;
            		l.data = data;
            		l.date = date;
            		log(l);
                }
        		return true;
        	}
    		return false;
    	} else {
    	    throw;
    	}
		
	}

}

contract ActionWithdraw is Action {
    
    address goldBank;
    
    function ActionWithdraw(address goldBankAddress, int perm) {
        goldBank = goldBankAddress;
        permission = perm;
    }
    
    function execute(uint amount) returns (bool) {
        if(checkPermission()) {
            return GoldBank(goldBank).withdraw(smartXAddress, smartXAddress, amount);
        } else {
            throw;
        }
    }
}

contract ActionDeposit is Action {
    
    address goldBank;
    
    function ActionDeposit(address goldBankAddress, int perm) {
        goldBank = goldBankAddress;
        permission = perm;
    }
    
    function execute(uint amount) returns (bool) {
        if(checkPermission()) {
            return GoldBank(goldBank).deposit(smartXAddress, smartXAddress, amount);
        } else {
            throw;
        }
    }
}

contract ActionTransfer is Action {
    
    address goldBank;
    
    function ActionTransfer(address goldBankAddress, int perm) {
        goldBank = goldBankAddress;
        permission = perm;
    }
    
    function execute(address addr, uint amount) returns (bool) {
        if(checkPermission()) {
            return GoldBank(goldBank).transfer(smartXAddress, addr, smartXAddress, amount);
        } else {
            throw;
        }
    }
}

contract GoldBank is Validee{

    string public name;
    string public symbol;
    uint8 public decimals;
    
    mapping (address => uint) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    function GoldBank(string tokenName, string tokenSymbol, uint8 tokenDecimals) {
        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimals;
    }
    
    function deposit(address smartXAddress, address addr, uint amount) returns (bool) {
        if(!validate(smartXAddress, msg.sender)){
            throw;
        }
        if(balanceOf[addr] + amount < balanceOf[addr]) {
            return false;
        }
        balanceOf[addr] += amount;
        Transfer(0, addr, amount);
        return true;
    }
    
    function withdraw(address smartXAddress, address addr, uint amount) returns (bool){
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        if (balanceOf[addr] < amount){
            return false;
        }
        balanceOf[addr] -= amount;
        Transfer(addr, 0, amount);
        return true;
    }
    
    function transfer(address smartXAddress, address _to, address _from, uint _value) returns (bool) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        if (balanceOf[_from] < _value) throw;
        if (balanceOf[_to] + _value < balanceOf[_to]) throw;
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        Transfer(_from, _to, _value);
        return true;
    }

}

contract ActionCreateGoldSmartContract is Action {
    
    address goldSmartContractBank;
    int permission;
    
    function ActionCreateGoldSmartContract(address goldSmartContractBankAddress, int perm) {
        goldSmartContractBank = goldSmartContractBankAddress;
        permission = perm;
    }
    
    function execute(string denomination) returns (bool) {
        if(checkPermission()) {
            GoldSmartContract gsc = new GoldSmartContract(smartXAddress, denomination, smartXAddress);
            return GoldSmartContractBank(goldSmartContractBank).addGoldSmartContract(smartXAddress, smartXAddress, gsc);
        } else {
            throw;
        }
    }
}

contract ActionDestroyGoldSmartContract is Action {
    
    address goldSmartContractBank;
    int permission;
    
    function ActionDestroyGoldSmartContract(address goldSmartContractBankAddress, int perm) {
        goldSmartContractBank = goldSmartContractBankAddress;
        permission = perm;
    }
    
    function execute(address addr) returns (bool) {
        if(checkPermission()) {
            GoldSmartContract(addr).destroyContract(smartXAddress);
            return GoldSmartContractBank(goldSmartContractBank).removeGoldSmartContract(smartXAddress, smartXAddress, GoldSmartContract(addr));
        } else {
            throw;
        }
    }
}

contract ActionTransferGoldSmartContract is Action {
    
    address goldSmartContractBank;
    int permission;
    
    function ActionTransferGoldSmartContract(address goldSmartContractBankAddress, int perm) {
        goldSmartContractBank = goldSmartContractBankAddress;
        permission = perm;
    }
    
    function execute(address GSCaddr, address toAddr) returns (bool) {
        if(checkPermission()) {
            GoldSmartContract(GSCaddr).transfer(smartXAddress, toAddr);
            return GoldSmartContractBank(goldSmartContractBank).transferGoldSmartContract(smartXAddress, smartXAddress, toAddr, GoldSmartContract(GSCaddr));
        } else {
            throw;
        }
    }
}

contract GoldSmartContractBank is Validee {
    mapping (address => GoldSmartContract[]) public contractsOf;
    
    function addGoldSmartContract(address smartXAddress, address owner, GoldSmartContract gsc) returns (bool) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        for(uint i=0;i<contractsOf[owner].length;i++) {
            if(contractsOf[owner][i]==gsc) {
                return false;
            }
        }
        contractsOf[owner][contractsOf[owner].length++]=gsc;
        return true;
    }
    
    function removeGoldSmartContract(address smartXAddress, address owner, GoldSmartContract gsc) returns (bool) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        for(uint i=0;i<contractsOf[owner].length;i++) {
            if(contractsOf[owner][i]==gsc) {
                delete contractsOf[owner][i];
                return true;
            }
        }
        return false;
    }
    
    function transferGoldSmartContract(address smartXAddress, address owner, address recipient, GoldSmartContract gsc) returns (bool) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        for(uint i=0;i<contractsOf[owner].length;i++) {
            if(contractsOf[owner][i]==gsc) {
                delete contractsOf[owner][i];
                contractsOf[recipient][contractsOf[recipient].length++] = gsc;
                return true;
            }
        }
        return false;
    }
    
}

contract GoldSmartContract is Validee {
    
    string public denomination;
    address public owner;
    
    function GoldSmartContract(address smartXAddress, string contractDenomination, address contractOwner) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        denomination = contractDenomination;
        owner = contractOwner;
    }
    
    function destroyContract(address smartXAddress) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        owner = 0;
    }
    
    function transfer(address smartXAddress, address recipient) {
        if(!validate(smartXAddress, msg.sender)) {
            throw;
        }
        owner = recipient;
    }
    
    function getContractAddress() constant returns (address) 
	{
		return this;
	}
    
}