var fs = require('fs');
var path = require('path');
var http = require('http');
var Busboy = require('busboy');

var htmlStr = 
`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <form action="/uploadFile" method="post" enctype="multipart/form-data" >
　　　　<input type="file" id="upload" name="upload" /> <br />
　　　　<input type="submit" value="Upload" />
　　</form>
</html>
`


http.createServer(function(req, res) {
    
    if (req.url === '/' || req.url === '' || req.url === '/index.html') {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/html');
        res.writeHead('200');
        res.end(htmlStr);
    }
    
    if (req.url.indexOf('uploadFile') >-1) {
        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            file.pipe(fs.createWriteStream('./submit.file'));
        });
        busboy.on('finish', function() {
            res.writeHead(200, { 'Connection': 'close' });
            res.end('file has been successfully saved');
        });
        return req.pipe(busboy);
    }
    
}).listen(8888)