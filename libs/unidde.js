var net = require('net');

var unidde = function(config) {
    var emitter = new events.EventEmitter();

    var tosend = '';
    var _tosend = '';

    var reconnectInterval = 0;

    var mySocket;

    var socket = createSocket();

    function createSocket() {
        var socket = new net.Socket();
        socket.setKeepAlive(true);
        socket.on('connect', function(){
            console.log('Socket connect on '+config.ip+':'+config.port);
            this.setNoDelay();
            mySocket = {
                socket: socket,
                readyState: 1,
                reconnectCycle: 0
            };
            clearInterval(reconnectInterval);
            socket.write(config.login+'\r\n'+config.password+'\r\n');
            _tosend = '';
        })
            .on('timeout', function(){
                console.log('Socket timeout on '+config.ip+':'+config.port);
                if (mySocket.endFlag != undefined || mySocket.reconnectCycle)
                    return;
                mySocket.reconnectCycle = 1;
                mySocket.readyState = 0;
                mySocket.socket.destroy();
                mySocket.socket = createSocket();
                reconnectInterval = setInterval(function(){
                    mySocket.trying = 1;
                    mySocket.socket.connect({port: config.port, host: config.ip});
                }, 4000);
            })
            .on('close', function(){
                console.log('Socket closed on '+config.ip+':'+config.port);
                if (!mySocket || mySocket.endFlag != undefined || mySocket.reconnectCycle)
                    return;
                mySocket.reconnectCycle = 1;
                mySocket.readyState = 0;
                mySocket.socket.destroy();
                mySocket.socket = createSocket();
                reconnectInterval = setInterval(function(){
                    mySocket.trying = 1;
                    mySocket.socket.connect({port: config.port, host: config.ip});
                }, 4000);
            })
            .on('error', function(err){
                console.log('Socket fault with error "'+err+'" on '+config.ip+':'+config.port);
                if (!mySocket || mySocket.trying == undefined && (mySocket.endFlag != undefined || mySocket.reconnectCycle))
                    return;
                mySocket.reconnectCycle = 1;
                mySocket.readyState = 0;
                mySocket.socket.destroy();
                mySocket.socket = createSocket();
                reconnectInterval = setInterval(function(){
                    mySocket.socket.connect({port: config.port, host: config.ip});
                }, 4000);
            })
            .on('data', function(data){
                _tosend += data.toString();
                //console.log("_tosend",_tosend);
                var tokens = _tosend.split(/\r\n|\r|\n/g);
                l = tokens.length-1;

                var left = '';

                if (tokens.length > 0) {
                    left = tokens[tokens.length - 1];
                    for(var i= 0, l=tokens.length-1; i < l; i++) {
                        var tok = tokens[i].split(' ');
                        if (tok.length != 3)
                            continue;

                        emitter.emit('quotes.'+tok[0],{
                            symbol: tok[0],
                            bid: parseFloat(tok[1]),
                            ask: parseFloat(tok[2])
                        });
                    }

                    _tosend = left;
                }
            });

        return socket;
    }
    
    socket.connect({port: config.port, host: config.ip});

    return emitter;
};


module.exports = unidde;