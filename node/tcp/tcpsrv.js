
require('net').createServer(function(sock) {
    sock.on('data', function(data) {
		console.log('DATA: ' + data);
		let {a, b} = _getParamFrom(data);
		let result = _handle(a, b);
        sock.write(`{code: 1, data: ${result}}`);
    });
}).listen(80, '127.0.0.1');

function _handle(a, b) {
	return a + b;
}

function _getParamFrom() {
	return {a: 1, b: 2};
}


