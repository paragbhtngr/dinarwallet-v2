var app = angular.module('dinarApp', ['ui.router','monospaced.qrcode']);

var ioPort = 8485;
var socket = io(location.origin);


app.config(function ($stateProvider,$urlRouterProvider) {

$urlRouterProvider.otherwise('/login');

    $stateProvider.state('dashboard', {
        url: '/dashboard',
        templateUrl: '../templates/dashboard.html',
        controller: 'dinarCtrl'
    })
    .state('clientlogin', {
        url: '/login',
        templateUrl: '../templates/login.html',
        controller: 'loginCtrl'
    })
    .state('clientsignup', {
        url: '/signup',
        templateUrl: '../templates/signup.html',
        controller: 'signupCtrl'
    })
    .state('forgotpassword', {
        url: '/forgot',
        templateUrl: '../templates/forgot.html',
        controller: 'loginCtrl'
    })
    .state('clientPortal', {
        url: '/client',
        templateUrl: '../templates/client.html',
        controller: 'mainCtrl'
    })

    .state('afteradminlogin',{
        url: '/admin/:name/:token',
        templateUrl: '../templates/dashboard.html',
        controller:"storeDataCtrl"
    })  
})