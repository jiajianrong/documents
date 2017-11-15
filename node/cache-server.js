var http = require('http');
var fs = require('fs');
http.createServer(function(req, res) {
    if (req.url === '/' || req.url === '' || req.url === '/index.html') {
        // <html><body><img src="cache.png"></body></html>
		fs.readFile('./index.html', function(err, file) {
            res.setHeader('Cache-Control', "no-cache");
            res.setHeader('Content-Type', 'text/html');
            res.writeHead('200');
            res.end(file);
        });
    }
    if (req.url === '/cache.png') {
        fs.readFile('./cache.png', function(err, file) {
            res.setHeader('Cache-Control', "max-age=" + 5);
            res.setHeader('Content-Type', 'images/png');
            res.writeHead('200');
            res.end(file);
        });
    }
}).listen(8888)