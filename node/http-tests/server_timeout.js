const http = require('http');


const sleep = (n) => {
    return new Promise(resolve=>{
        setTimeout( ()=>resolve(), n )
    })
}


/**
 * server 4秒返回，但3秒超时
 **/
const srv = http.createServer(async function(req, res) {
    await sleep(4000)
    res.end('123')
}).listen(8003).setTimeout(3000)


srv.on('timeout', function(socket) {
    //socket.end(`HTTP/1.1 200 OK\nContent-Type: application/json;charset=UTF-8\n\n{"code":-1, "msg":"server timeout"}`);
    socket.end('HTTP/1.1 200 OK\n\nbody');
    //socket.end('HTTP/1.1 300 Bad Request Request Invalid\n\n');
    
    
//  socket.write([
//      'HTTP/1.1 200 OK',
//      'Content-Type: text/html; charset=UTF-8',
//      'Content-Encoding: UTF-8',
//      'Accept-Ranges: bytes',
//      'Connection: keep-alive',
//  ].join('\n') + '\n\n');
//  
//  socket.write(`
//      <h1> Example </h1>
//  `);
//  
//  socket.end();
})

