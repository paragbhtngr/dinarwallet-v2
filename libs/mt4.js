var mt4 = function (config) {
    var host = config.ip;
    var port = config.port;
    var master = config.master;

    var executeQuery = function (method, queryData, callback) {
        queryData['master'] = master;
        var query = [];
        query.push(method);
        for (var k in queryData) {
            if (!queryData.hasOwnProperty(k)) {
                continue;
            }
            query.push([k, queryData[k]].join('='));
        }

        var req = ['W', query.join('|'), '\n', 'QUIT', '\n'].join('');

        var socket = new net.Socket();

        socket.on('connect', function () {
            socket.write(req);

            var ret = '';
            socket.on('data', function (chunk) {
                ret += chunk.toString();

                var toks = ret.split('\r\n');

                if (toks.length < 4) {

                    return;
                }

                if (toks[0] == 'OK') {
                    callback && callback(JSON.parse(toks[1]));
                } else {
                    callback && callback(false);
                }

                socket.destroy();
            })
        });
        socket.connect({port: port, host: host});
    };

    return {
        query: executeQuery
    }
};

module.exports = mt4;