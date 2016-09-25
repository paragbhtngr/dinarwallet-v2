app.controller('loginCtrl', function ($scope, $http, $state, $rootScope, dataFactory) {
    console.log("loginCtrl called");

    $scope.loginUser = function () {
        console.log("login controller callled");
        $http({
            method: 'POST',
            url: '/api/v1/user/login',
            data: {
                email: $scope.email,
                password: $scope.password
            }
        }).then(function successCallback(response) {
            console.log("login controller " + response);
            dataFactory.clearAll();
            $rootScope.loginFlag = true;
            console.log("value is..." + $scope.loginFlag);
            
            // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
			// throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
			// to avoid the entire page breaking, without having to do a check at each usage of Storage.
			if (typeof localStorage === 'object') {
			    try {
			        dataFactory.saveUserName(response.data.object.email);
		            dataFactory.saveAuthToken(response.data.object.auth_token);
		            //$state.go('clientPortal');
		            window.location = location.origin + "/wallets";

			    } catch (e) {
			        Storage.prototype._setItem = Storage.prototype.setItem;
			        Storage.prototype.setItem = function() {};
			        alert('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Please switch to a browser that supports localStorage');
			    }
			}
       
        }, function errCallback(error) {
            console.log("Error in login", error);
            $scope.message = error.data.message;
        });
    }

    $scope.forgotPage = function () {
        console.log("forgotPage  running..");
        $state.go('forgotpassword');
    }

    $scope.forgotPassword = function (email) {
        console.log("forgot password running." + email);
        $http({
            method: 'POST',
            url: '/api/v1/user/forgotpassword',
            data: {
                email: email
            }
        }).then(function successCallback(response) {
            console.log("lorgot password running. " + JSON.stringify(response));
            alert(response.data.message);
            //   $rootScope.loginFlag = true;
            // console.log("value is..."+$scope.loginFlag);
            //$state.go('dashboard');

            // dataFactory.saveUserName(response.data.object.email);
            //dataFactory.saveAuthToken(response.data.object.auth_token);
        }, function errCallback(error) {
            console.log("Error in forgotpassword", error);
            // $scope.message = error.data.message;
        });




    }

    $scope.goToRegister = function () {
        console.log("clientsignup")
        $state.go('clientsignup');
    }

}).controller('signupCtrl', function ($scope, $http, $state, dataFactory) {
    console.log("sigupCtrl");

    $scope.user = {};
    $scope.registered = false;
    $scope.country={};

    $http({
        method: 'GET',
        url: '/api/v1/user/country_list'

    }).then(function successCallback(response) {
       // console.log("Getting Country list" + JSON.stringify(response));

       $scope.country=response.data;

    }, function errCallback(error) {
        console.log("Error in getting Country list", error);

    });


    $scope.registerUser = function () {

    	if($scope.isValidPassword($scope.user.password)) {

	    	$scope.registered = true;
	        $http({
	            method: 'POST',
	            url: '/api/v1/user/register',
	            data: {
	                user: $scope.user
	            }
	        }).then(function successCallback(response) {
	            console.log(response.data.object);
	            if (response.data.object) {
	                location.hash="#/login"
	                console.log(response.data.object.email);
	                dataFactory.saveUserName(response.data.object.email);
	            } else
	                $scope.message = response.data.message;
	        }, function errCallback(error) {
	        	$scope.registered = false;
	            console.log("Error in login", error);
	            $scope.message = error.data.message;
	        });
        } else {
	        $scope.message = "Password must have at least 1 letter, number, symbol and be at least 8 characters long";
        }
    }
    
    $scope.isValidPassword = function(password) {
		return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/);
	}
    
    $scope.registerUserPre = function() {

	    if(!$scope.registered) {

		    $scope.registerUser();
	    } else {

		    window.alert("Your Account is Being Created");
	    }
    }
    
    $scope.goToSignIn = function () {
        console.log("clientlogin")
        $state.go('clientlogin');
    }
}).factory('dataFactory', function () {
    return {
        saveUserName: function (name) {
            localStorage.setItem('user_name', name);
        },
        getUserName: function () {
            return localStorage.getItem('user_name');
        },
        clearAll: function () {
            localStorage.clear();
        },
        saveAuthToken: function (token) {
            localStorage.setItem("x-auth-token", token);
        },
        get_auth_token: function () {
            return localStorage.getItem("x-auth-token")
        }
    }
}).factory('addressFactory', function(){
	return {
		isAddress: function (address) {
		    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		        // check if it has the basic requirements of an address
		        return false;
		    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
		        // If it's all small caps or all all caps, return true
		        return true;
		    } else {
		        // Otherwise check each case
		        return isChecksumAddress(address);
		    }
		},
		
		isChecksumAddress: function (address) {
		    // Check each case
		    address = address.replace('0x','');
		    var addressHash = sha3(address.toLowerCase());
		    for (var i = 0; i < 40; i++ ) {
		        // the nth letter should be uppercase if the nth digit of casemap is 1
		        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
		            return false;
		        }
		    }
		    return true;
		}
	}
}).controller('mainCtrl', function ($scope, dataFactory, addressFactory, $rootScope,$http) {
    console.log("mainCtrl");
    var timeout;
    
    $scope.quotes={};
    $scope.goldSmartContractBalances={};
    $scope.BTCETH = ["BTC","ETH"];
    $scope.btcOrETH = "BTC";
    
    $scope.goldSmartContracts = ['GOLD_1G', 'GOLD_100G', 'GOLD_1KG', 'SILVER100Oz', 'SILVER1KG'];
    
    $scope.gscSelected = function(gsc) {
	    $scope.currentGSC = gsc;
    }
    
    //$scope.loginFlag = true;
    $scope.getBalances = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/balances",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.smartXAddress = response.data.smartXAddress;
        	$scope.dinarBalance = response.data.dinar;
        	for(var i=0;i<$scope.goldSmartContracts.length;i++) {
			    $scope.goldSmartContractBalances[$scope.goldSmartContracts[i]] = response.data[$scope.goldSmartContracts[i]];
		    }
        	$scope.btcAddress = response.data.bitcoinAddress;
        	$scope.btcBalance = response.data.bitcoinBalance;
        	$scope.pendingBTC = response.data.pendingBTC;
        	$scope.pendingETH = response.data.pendingETH;
        	$scope.ethAddress = response.data.ethAddress;
        	$scope.ethBalance = response.data.ethBalance;
        	clearTimeout(timeout);
        	timeout = setTimeout($scope.getBalances, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            clearTimeout(timeout);
            timeout = setTimeout($scope.getBalances, 60000)
        });
    }
    
    $scope.getBTCinUSD = function() {
    	$http({
            method: "GET",
            url: "/api/v1/user/btcInUSD"
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.btcInUSD = response.data.btcInUSD
        	setTimeout($scope.getBTCinUSD, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getBTCinUSD, 60000)
        });
    }
    
    $scope.getETHinUSD = function() {
    	$http({
            method: "GET",
            url: "/api/v1/user/ethInUSD"
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.ethInUSD = response.data.ethInUSD
        	setTimeout($scope.getETHinUSD, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getETHinUSD, 60000)
        });
    }
    
    $scope.getKYCAML = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/getKYCAML",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.KYCAML = response.data;
        	$scope.KYCAML.dob = new Date($scope.KYCAML.dob);
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
        });
    }
    
    $scope.getReports = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/getReports",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.reports = response.data;
        	setTimeout($scope.getReports, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getReports, 60000)
        });
    }
    
    $scope.incomingBTC = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/incomingBTC",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.incomingBTC = response.data;
        	setTimeout($scope.incomingBTC, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.incomingBTC, 60000)
        });
    }
    
    $scope.incomingETH = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/incomingETH",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.incomingETH = response.data;
        	setTimeout($scope.incomingETH, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.incomingETH, 60000)
        });
    }
    
    $scope.getAPIToken = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/getAPIToken",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.apiToken = response.data;
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
        });
    }

    $scope.loginMessage = dataFactory.getUserName();
    if ($scope.loginMessage) {
        $rootScope.loginFlag = true;
        $scope.getKYCAML();
        $scope.getBTCinUSD();
        $scope.getETHinUSD();
        $scope.getBalances();
        $scope.getReports();
        $scope.incomingBTC();
        $scope.incomingETH();
        $scope.getAPIToken();
    }
    
    socket.emit('quotes.sub', {symbol: 'GOLD_1DINAR'});
    for(var i=0;i<$scope.goldSmartContracts.length;i++) {
	    socket.emit('quotes.sub', {symbol: $scope.goldSmartContracts[i]});
    }
    socket.on('a',function(data){
    	//console.log(data);
    	if(data && data.data && data.data.symbol) {
	    	$scope.quotes[data.data.symbol] = data.data;
	    	$scope.$apply();
	    }
    })
    
    console.log("login message", $scope.loginMessage);

    $scope.logout = function () {
        console.log("Logout is called");
        $http({
            method: "GET",
            url: "/api/v1/user/logout",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
            $rootScope.loginFlag = false;
            console.log("Successfully logout");
            dataFactory.clearAll();
            console.log(response);
			//$state.go('clientlogin');
			window.location.pathname="";

        }, function errCallback(error) {
            console.log("error is" + error);
        });
    }
    
    $scope.updateKYCAMLInfo = function() {
	    $http({
            method: "POST",
            url: "/api/v1/user/updateKYCAML",
            data: {"KYCAML":$scope.KYCAML},
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log("update KYCAML Successful");
        	$scope.getKYCAML();
        	//location.reload();

        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
        });
    }
        
    $scope.buyDinar = function() {
	    if($scope.dinarToBuy > 0) {
		    $http({
	            method: "POST",
	            url: "/api/v1/user/buyDinar",
	            data: {"amt":$scope.dinarToBuy,"btcOrETH":$scope.btcOrETH},
	            headers: {
	                "x-auth-token": dataFactory.get_auth_token
	            }
	        }).then(function successCallback(response) {
	        	console.log("Buy Successful");
	        	console.log("Hash: " + response.data.hash);
	        	$scope.latestHash = response.data.hash;
	        	window.alert("Hash: " + $scope.latestHash);
	        	$scope.getBalances();
	        	$scope.getReports();
	        	//location.reload();
	
	        }, function errCallback(error) {
	            console.log("error is"+JSON.stringify(error));
	        });
	    } else {
		    window.alert("Must buy more than 0 Dinar");
	    }
    }
    
    $scope.sellDinar = function() {
	    if($scope.dinarToSell > 0) {
		    $http({
	            method: "POST",
	            url: "/api/v1/user/sellDinar",
	            data: {"amt":$scope.dinarToSell,"btcOrETH":$scope.btcOrETH},
	            headers: {
	                "x-auth-token": dataFactory.get_auth_token
	            }
	        }).then(function successCallback(response) {
	        	console.log("Sell Successful");
	        	console.log("Hash: " + response.data.hash);
	        	$scope.latestHash = response.data.hash;
	        	window.alert("Hash: " + $scope.latestHash);
	        	$scope.getBalances();
	        	$scope.getReports();
	        	//location.reload();
	
	        }, function errCallback(error) {
	            console.log("error is"+JSON.stringify(error));
	        });
	    } else {
		    window.alert("Must Sell more than 0 Dinar");
	    }
    }
    
    $scope.transferDinar = function() {
	    if(addressFactory.isAddress($scope.toAddress)) {
	    	$scope.dinarToTransfer = precise_round($scope.dinarToTransfer,4)
	    	if($scope.dinarToTransfer > 0 && $scope.dinarToTransfer <= $scope.dinarBalance) {
			    $http({
		            method: "POST",
		            url: "/api/v1/user/transferDinar",
		            data: {"toAddress":$scope.toAddress,"amt":$scope.dinarToTransfer,"btcOrETH":$scope.btcOrETH},
		            headers: {
		                "x-auth-token": dataFactory.get_auth_token
		            }
		        }).then(function successCallback(response) {
		        	console.log("Transfer Successful");
		        	console.log("Hash: " + response.data.hash);
		        	$scope.latestHash = response.data.hash;
		        	window.alert("Hash: " + $scope.latestHash);
		        	$scope.getBalances();
		        	$scope.getReports();
		        	//location.reload();
		
		        }, function errCallback(error) {
		            console.log("error is"+JSON.stringify(error));
		        });
	        } else {
			    window.alert("Invalid Dinar Amount");
		    }
	    } else {
	    	window.alert("Invalid Address");
	    }
    }
    
    $scope.GSCForm = {};
    $scope.buyGSC = function(goldSmartContract) {
	    if($scope.GSCForm[goldSmartContract].amountToBuy > 0) {
		    $http({
	            method: "POST",
	            url: "/api/v1/user/buyGSC",
	            data: {"GSC":goldSmartContract,"amt":$scope.GSCForm[goldSmartContract].amountToBuy,"btcOrETH":$scope.btcOrETH},
	            headers: {
	                "x-auth-token": dataFactory.get_auth_token
	            }
	        }).then(function successCallback(response) {
	        	console.log("Buy Successful");
	        	console.log("Hash: " + response.data.hash);
	        	$scope.latestHash = response.data.hash;
	        	window.alert("Hash: " + $scope.latestHash);
	        	$scope.getBalances();
	        	$scope.getReports();
	        	//location.reload();
	
	        }, function errCallback(error) {
	            console.log("error is"+JSON.stringify(error));
	        });
	    } else {
		    window.alert("Must buy more than 0 " + goldSmartContract + " GSC");
	    }
    }
    
    $scope.sellGSC = function(goldSmartContract) {
	    if($scope.GSCForm[goldSmartContract].amountToSell && $scope.GSCForm[goldSmartContract].amountToSell > 0) {
		    $http({
	            method: "POST",
	            url: "/api/v1/user/sellGSC",
	            data: {"GSC":goldSmartContract,"amt":$scope.GSCForm[goldSmartContract].amountToSell,"btcOrETH":$scope.btcOrETH},
	            headers: {
	                "x-auth-token": dataFactory.get_auth_token
	            }
	        }).then(function successCallback(response) {
	        	console.log("Sell Successful");
	        	console.log("Hash: " + response.data.hash);
	        	$scope.latestHash = response.data.hash;
	        	window.alert("Hash: " + $scope.latestHash);
	        	$scope.getBalances();
	        	$scope.getReports();
	        	//location.reload();
	
	        }, function errCallback(error) {
	            console.log("error is"+JSON.stringify(error));
	        });
	    } else if($scope.GSCForm[goldSmartContract].amountToSell <= 0) {
		    window.alert("Must buy more than 0 " + goldSmartContract + " GSC");
	    }
    }
    
    $scope.transferGSC = function(goldSmartContract) {
	    if(addressFactory.isAddress($scope.GSCForm[goldSmartContract].toAddress)) {
	    	if($scope.GSCForm[goldSmartContract].amountToTransfer > 0 && $scope.GSCForm[goldSmartContract].amountToTransfer <= $scope.goldSmartContractBalances[goldSmartContract]) {
			    $http({
		            method: "POST",
		            url: "/api/v1/user/transferGSC",
		            data: {"GSC":goldSmartContract, "toAddress":$scope.GSCForm[goldSmartContract].toAddress,"amt":$scope.GSCForm[goldSmartContract].amountToTransfer,"btcOrETH":$scope.btcOrETH},
		            headers: {
		                "x-auth-token": dataFactory.get_auth_token
		            }
		        }).then(function successCallback(response) {
		        	console.log("Transfer Successful");
		        	console.log("Hash: " + response.data.hash);
		        	$scope.latestHash = response.data.hash;
		        	window.alert("Hash: " + $scope.latestHash);
		        	$scope.getBalances();
		        	$scope.getReports();
		        	//location.reload();
		
		        }, function errCallback(error) {
		            console.log("error is"+JSON.stringify(error));
		        });
	        } else {
			    window.alert("Invalid Dinar Amount");
		    }
	    } else {
	    	window.alert("Invalid Address");
	    }
    }
    
    $scope.withdrawBTC = function() {
	    $http({
	        method: "POST",
	        url: "/api/v1/user/withdrawBTC",
	        data: {"address":$scope.toBTCAddress,"amt":$scope.btcToWithdraw},
	        headers: {
	            "x-auth-token": dataFactory.get_auth_token
	        }
	    }).then(function successCallback(response) {
	    	console.log("Withdraw Successful");
	    	console.log("Hash: " + response.data);
	    	$scope.latestBTCHash = response.data.data;
	    	window.alert("Hash: " + $scope.latestBTCHash);
	    	$scope.getBalances();
	    	$scope.getReports();
	    	//location.reload();
	
	    }, function errCallback(error) {
	        console.log("error is"+JSON.stringify(error));
	    });
    }
    
    $scope.withdrawETH = function() {
	    $http({
	        method: "POST",
	        url: "/api/v1/user/withdrawETH",
	        data: {"address":$scope.toETHAddress,"amt":$scope.ethToWithdraw},
	        headers: {
	            "x-auth-token": dataFactory.get_auth_token
	        }
	    }).then(function successCallback(response) {
	    	console.log(response);
	    	if(response.data.status=="success") {
		    	console.log("Withdraw Successful");
		    	console.log("Hash: " + response.data.hash);
		    	window.alert("Hash: " + response.data.hash);
		    	$scope.latestETHHash = response.data.hash;
		    	$scope.getBalances();
		    	$scope.getReports();
		    	//location.reload();
	    	} else {
		    	console.log("fail");
		    	console.log(response.data.error);
	    	}
	
	    }, function errCallback(error) {
	        console.log("error is"+JSON.stringify(error));
	    });
    }
    
    $scope.makeAPIToken = function() {
	    $http({
	        method: "GET",
	        url: "/api/v1/user/generateAPIToken",
	        headers: {
	            "x-auth-token": dataFactory.get_auth_token
	        }
	    }).then(function successCallback() {
	    	$scope.getAPIToken();
	
	    }, function errCallback(error) {
	        console.log("error is"+JSON.stringify(error));
	    });
    }
    
    $scope.toDateString = function(date) {
	    return new Date(date).toDateString()
    }
    
    $scope.dncFilter = function(tx) {
    	//console.log(tx.type.indexOf("DNC"));
	    return tx.type.indexOf("DNC")!=-1;
    }
    
    $scope.ethFilter = function(tx) {
	    return tx.type.indexOf("ETH")!=-1;
    }
    
    $scope.btcFilter = function(tx) {
	    return tx.type.indexOf("BTC")!=-1;
    }
    
    $scope.toDate = function(item) {
    	console.log(item.createdAt);
	    return -(new Date(item.createdAt).getTime())
    }
    
    function precise_round(num,decimals){
		return Math.floor(num*Math.pow(10,decimals))/Math.pow(10,decimals);
	}

}).controller('storeDataCtrl', function ($scope, dataFactory, $rootScope,$location,$state) {
    console.log("Store data controller called");
    var url=$location.url();
    var urlArray=url.split('/');
    $rootScope.loginFlag = true;
    dataFactory.saveUserName(urlArray[urlArray.length-2]);
    dataFactory.saveAuthToken(urlArray[urlArray.length-1]);
    $state.go('dashboard', {}, {reload: true});
}).controller('headerCtrl', function ($scope, dataFactory, $rootScope,$state,$http) {
    $scope.logout = function () {
        console.log("Logout is called");
        $http({
            method: "GET",
            url: "/api/v1/user/logout",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
            $rootScope.loginFlag = false;
            console.log("Successfully logout");
            dataFactory.clearAll();
            console.log(response);
			$state.go('clientlogin');

        }, function errCallback(error) {
            console.log("error is" + error);
        });
    }
}).controller('blockchainController', function ($scope, dataFactory, $rootScope,$location, $http) {
    
    $scope.goldSmartContracts = ['GOLD_1G', 'GOLD_100G', 'GOLD_1KG', 'SILVER100Oz', 'SILVER1KG'];
    
    $scope.timeFrom = function(date) {
	    var msFromDate = new Date() - new Date(date);
	    var stringDate = "";
	    var second = 1000;
	    var minute = 60 * second;
	    var hour = 60 * minute;
	    var day = 24 * hour;
	    var year = 365 * day;
	    if(msFromDate < second) {
		    stringDate = "Just Now";
		    return stringDate;
	    }
	    if(msFromDate < minute) {
	    	stringDate = Math.floor(msFromDate/second) + " seconds ago";
		    return stringDate;
	    }
	    if(msFromDate < hour) {
	    	stringDate = Math.floor(msFromDate/minute) + " mins " + Math.floor((msFromDate%minute)/second) + " seconds ago";
		    return stringDate;
	    }
	    if(msFromDate < day) {
	    	stringDate = Math.floor(msFromDate/hour) + " hrs " + Math.floor((msFromDate%hour)/minute) + " mins ago";
		    return stringDate;
	    }
	    if(msFromDate < year) {
	    	stringDate = Math.floor(msFromDate/day) + " days " + Math.floor((msFromDate%day)/hour) + " hours ago";
		    return stringDate;
	    }
    	stringDate = Math.floor(msFromDate/year) + " years " + Math.floor((msFromDate%year)/day) + " days ago";
	    return stringDate;
    }
    
    $scope.filterByAddress = function(tx) {
	    if(!$scope.filterAddress || tx.smartXAddress==$scope.filterAddress || tx.otherAddress==$scope.filterAddress) {
		    return true;
	    }
	    return false;
    }
    
    $scope.getBlockchain = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/getBlockchain",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.blockchain = response.data;
        	setTimeout($scope.getReports, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getReports, 60000)
        });
    }
    
    $scope.getEthereumBalances = function() {
	    $http({
            method: "GET",
            url: "/api/v1/user/ethereumBalances",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
        	console.log(response);
        	$scope.ethereumBalances = response.data;
        	setTimeout($scope.getEthereumBalances, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getEthereumBalances, 60000)
        });
    }

    $scope.loginMessage = dataFactory.getUserName();
    if ($scope.loginMessage) {
        $scope.getBlockchain();
        $scope.getEthereumBalances();
    }
    
    $scope.logout = function () {
        console.log("Logout is called");
        $http({
            method: "GET",
            url: "/api/v1/user/logout",
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
        }).then(function successCallback(response) {
            $rootScope.loginFlag = false;
            console.log("Successfully logout");
            dataFactory.clearAll();
            console.log(response);
			//$state.go('clientlogin');
			window.location.pathname="";

        }, function errCallback(error) {
            console.log("error is" + error);
        });
    }
    
    $scope.total = function(balanceToCheck) {
    	var total = 0;
    	if($scope.ethereumBalances) {
	    	for(var i=0;i<$scope.ethereumBalances.length;i++) {
			    total += $scope.ethereumBalances[i][balanceToCheck];
		    }
    	}
	    return Math.round(total*4)/4;
    }
    
    $scope.sortGSC = "GOLD_1G";
    
    $scope.updateSortGSC = function(gsc) {
	    $scope.sortGSC = gsc;
    }
    
    $scope.toDate = function(item) {
    	console.log(item.createdAt);
	    return -(new Date(item.createdAt).getTime())
    }
    
    
});