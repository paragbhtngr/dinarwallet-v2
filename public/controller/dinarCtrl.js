app.factory('dataFactory', function () {
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
}).controller('dinarCtrl', function($scope, dataFactory, $http) {
	$scope.denominations = ['GOLD_100G', 'GOLD_1DINAR', 'GOLD_1G', 'GOLD_1KG', 'SILVER100Oz', 'SILVER1KG'];
	$scope.periods = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];
	$scope.periodList = {M1:60, M5:300, M15:900, M30:1800, H1:3600, H4:14400, D1:86400, W1:604800, MN:18144000};
	$scope.colorList = {'GOLD_100G':{"color":"#e9d482","button":"btn-gold"}, 'GOLD_1DINAR':{"color":"#e9d482","button":"btn-gold"}, 'GOLD_1G':{"color":"#e9d482","button":"btn-gold"}, 'GOLD_1KG':{"color":"#e9d482","button":"btn-gold"}, 'SILVER100Oz':{"color":"#cecccc","button":"btn-silver"}, 'SILVER1KG':{"color":"#cecccc","button":"btn-silver"}};
	$scope.currentDenomination = $scope.denominations[0];
	$scope.currentPeriod = $scope.periods[0];
	$scope.graphTimeout;
	$scope.drawGraph = function(){
		setTimeout(function(){
			$http({
				method: 'GET',
				url: '/getHistoryQuotes/bid/'+$scope.currentDenomination+'/'+$scope.currentPeriod
			}).then(function successCallback(response) {
				if(response.data.length>30) {
					response.data = response.data.slice(response.data.length-30);
				}
				for(var i=0;i<response.data.length;i++) {
					if(response.data[i][0] + 30 * $scope.periodList[$scope.currentPeriod]*1000 < (new Date()).getTime()) {
						response.data.splice(i, 1);
						i--;
					} else {
						response.data[i][0] = new Date(response.data[i][0]);
					}
				}
				$scope.tradingValues = response.data;
			    drawChart(response.data, $scope.colorList[$scope.currentDenomination].color);
			}, function errorCallback(response) {
			    console.log("Error getting Chart Data");
			    console.log(response);
			});
		}, 500)
		clearTimeout($scope.graphTimeout);
		$scope.graphTimeout = setTimeout(function(){$scope.drawGraph()},$scope.periodList[$scope.currentPeriod]*1000);
	}
	
	$scope.tableHeight = function() {
		return 100 + document.getElementById("dataTable").offsetHeight;
	}
	$scope.demoniationChange = function(denomination) {
		$scope.currentDenomination = denomination;
		$scope.drawGraph();
	}
	
	$scope.periodChange = function(period) {
		$scope.currentPeriod = period;
		$scope.drawGraph();
	}
	
	$scope.isHeaderActive = function(tab) {
		return location.hash.indexOf("#/" + tab) == 0 ? "active" : "";
	}
	
	$scope.rejectBurnRequest = function(id) {
		console.log(id);
		$http({
			method: 'POST',
			url: '/api/v1/admin/rejectBurnRequest',
			data: {id: id},
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				console.log("Reject Success " + id);
				setTimeout(function(){$scope.getBurnRequests();
				$scope.getUserBalances();},1000);
			}
		}, function errorCallback(response) {
		    console.log("Error rejecting");
		    console.log(response);
		});
	}
	
	$scope.acceptBurnRequest = function(id) {
		console.log(id);
		$http({
			method: 'POST',
			url: '/api/v1/admin/acceptBurnRequest',
			data: {id: id},
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				console.log("Accept Success " + id);
				setTimeout(function(){$scope.getBurnRequests();
				$scope.getUserBalances();},1000);
			}
		}, function errorCallback(response) {
		    console.log("Error accepting");
		    console.log(response);
		});
	}
	
	$scope.getAddresses = function() {
		$http({
			method: 'GET',
			url: '/api/v1/admin/ethereumAddresses',
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				$scope.actionManagerAddress = response.data.actionManager;
				$scope.goldBankAddress = response.data.goldBank;
				$scope.GSCBankAddress = response.data.GSCBank;
			}
		}, function errorCallback(response) {
		    console.log("Error getting Addresses");
		    console.log(response);
		});
	}
	
	$scope.getLogs = function() {
		$http({
			method: 'GET',
			url: '/api/v1/admin/getLogs',
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				$scope.logs = response.data;
			}
		}, function errorCallback(response) {
		    console.log("Error getting Logs");
		    console.log(response);
		});
	}
	
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
        	$scope.btcAddress = response.data.bitcoinAddress;
        	$scope.btcBalance = response.data.bitcoinBalance;
        	$scope.ethAddress = response.data.ethAddress;
        	$scope.ethBalance = response.data.ethBalance;
        	setTimeout($scope.getBalances, 60000)
        }, function errCallback(error) {
            console.log("error is"+JSON.stringify(error));
            setTimeout($scope.getBalances, 60000)
        });
    }
    
    $scope.UserBalancesTimeout;
    $scope.getUserBalances = function() {
    	$http({
			method: 'GET',
			url: '/api/v1/admin/balances',
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				$scope.userBalances = response.data;
			}
			clearTimeout($scope.UserBalancesTimeout);
			$scope.UserBalancesTimeout = setTimeout($scope.getUserBalances, 60000)
		}, function errorCallback(response) {
		    console.log("Error getting User Balances");
		    console.log(response);
		    clearTimeout($scope.UserBalancesTimeout);
		    $scope.UserBalancesTimeout = setTimeout($scope.getUserBalances, 60000)
		});
    }
    
    $scope.burnTimeout;
    $scope.getBurnRequests = function() {
    	$http({
			method: 'GET',
			url: '/api/v1/admin/burnRequests',
            headers: {
                "x-auth-token": dataFactory.get_auth_token
            }
		}).then(function successCallback(response) {
			if(response.data) {
				for(var i=0;i<response.data.length;i++) {
					if(response.data[i].contracts) {
						response.data[i].contracts = response.data[i].contracts.split(",");
					}
				}
				$scope.burnRequests = response.data;
			}
			clearTimeout($scope.burnTimeout);
			$scope.burnTimeout = setTimeout($scope.getBurnRequests, 60000)
		}, function errorCallback(response) {
		    console.log("Error getting Burn Requests");
		    console.log(response);
		    clearTimeout($scope.burnTimeout);
		    $scope.burnTimeout = setTimeout($scope.getBurnRequests, 60000)
		});
    }
	
	$scope.getAddresses();
	$scope.getLogs();
	$scope.getBalances();
	$scope.getUserBalances();
	$scope.getBurnRequests();
	
	//For Demo Only;
	/*$scope.buyHashes = {'GOLD_100G':'0xf1d8ca3004b6680137e263e438269bfeeeb845abb5a60d9a92f659999b8fe4a6', 'GOLD_1DINAR':'0x7ca3a2c156fd5b9437c0abf47e2a8d0c5a97a4d85826ad6c08f89be998ad5025', 'GOLD_1G':'0xfb88d01db9015f6b0fc5f5dae7672e4c501e2c3c8cc3c7c7ac7cfe7e40ca6b21', 'GOLD_1KG':'0xb626bdb5e90695e519c3ecd8ac14ddac8c8eb5d40814a338d1ad6d314ba39a90', 'SILVER100Oz':'0xe8e7f6374a7e1124566dcefd3555b84edb7cb03c172419792bf1dcce6a675aa1', 'SILVER1KG':'0xda06a310059e935c01ae3995a8fa24d2922004072187fa2dd1d6d5281c5677dc'};
	$scope.sellHashes = {'GOLD_100G':'0xd8cb2cbfda901a3112ca639174284d47c5ce6e84740571685872aa0cec243ccc', 'GOLD_1DINAR':'0xe5669df8c33a20078091f986a2b708645ff5a97994fce99a729086ea5c8a106d', 'GOLD_1G':'0x68fafca528ac32f65b9285c2f27dc8e25d3283b82bb6891983e287e1af733b32', 'GOLD_1KG':'0xf4cd288308ea223d5f0587f5d52b80c2f4ff8fec8b5076d2c629c0c19d69c92e', 'SILVER100Oz':'0x9d5acd967187d7efb2faa1a167012455aedbfba34553cc07ee3a7e2fdd889830', 'SILVER1KG':'0xb9ecbd75316283014ac51c880af85ee91a5122d874c724d0b84b75f6412dc258'};
	$scope.buy = function() {
		$scope.hash = "Buy hash: " + $scope.buyHashes[$scope.currentDenomination]
		$scope.confirmationCount=0;
		clearTimeout($scope.to);
		$scope.to=setTimeout($scope.increaseTransactions, 8000);
	}
	
	$scope.sell = function() {
		$scope.hash = "Sell hash: " + $scope.sellHashes[$scope.currentDenomination]
		$scope.confirmationCount=0;
		clearTimeout($scope.to);
		$scope.to=setTimeout($scope.increaseTransactions, 4000);
	}
	
	$scope.increaseTransactions = function() {
		$scope.confirmationCount++;
		$scope.$apply();
		clearTimeout($scope.to);
		$scope.to=setTimeout($scope.increaseTransactions, Math.floor((Math.random() * 2000) + 3000));
	}*/
});


app.filter('reverse', function() {
  return function(items) {
  	if(items) return items.slice().reverse();
  	else return [];
  };
});
