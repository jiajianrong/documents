const net = require('net');


var content = 
`HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8

{"code":0}`;


var badContent = 
'HTTP/1.1 400 Bad Request\r\n' +
'Content-Length: 0\r\n' +
'\r\n';


net.createServer((socket) => {
    socket.end(badContent);
}).on('error', (err) => {
    console.log('err occurs', err);
    throw err;
}).listen(9900, 'localhost', (511*4-1))