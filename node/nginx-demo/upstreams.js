var http = require('http');

http.createServer(function(req, res) {
    res.end('9900')
}).listen(9900)


http.createServer(function(req, res) {
    res.end('8800')
}).listen(8800)


http.createServer(function(req, res) {
    res.end('7700')
}).listen(7700)

