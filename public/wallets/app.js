var app = angular.module('dinarApp', ['monospaced.qrcode']);

var ioPort = 8485;
var socket = io(location.origin);