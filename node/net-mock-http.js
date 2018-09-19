const net = require('net');

var content = 
`HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8

{"code":0}`;

net.createServer((socket) => {
    socket.end(content);
}).on('error', (err) => {
    console.log('err occurs', err);
    throw err;
}).listen(9900, 'localhost', (511*4-1))