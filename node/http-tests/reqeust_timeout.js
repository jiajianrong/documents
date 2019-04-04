const http = require('http');


const sleep = (n) => {
    return new Promise(resolve=>{
        setTimeout( ()=>resolve(), n )
    })
}


/**
 * 创建server，每个请求hold 3秒响应
 **/

const server = http.createServer(function (req, res) {
    sleep(3000).then(()=>{
        res.end('Hello World\n');
    })
}).listen(8000);


sleep(1000).then(request)


/**
 * 创建request，设置timeout为2秒
 * 会触发request的timeout event
 * 需要手动捕获并abort
 * abort时，抛出socket hang up，触发error event
 *
 * 最终输出
>node reqeust_abort.js
start request
timeout
{ Error: socket hang up
    at createHangUpError (_http_client.js:331:15)
    at Socket.socketCloseListener (_http_client.js:363:23)
    at emitOne (events.js:121:20)
    at Socket.emit (events.js:211:7)
    at TCP._handle.close [as _onclose] (net.js:554:12) code: 'ECONNRESET' }
 **/

function request() {
    
    console.log('start request')
    
    const req = http.request({
        timeout: 2000,
        headers: {Connection: 'keep-alive',},
        hostname:  'localhost',
        path: '/',
        port: 8000,
    }, res => {
        res.on('data', (data)=>{
            console.log('request data, ', data)
        })
        res.on('end', ()=>{
            console.log('end request')
        })
    })
    
    req.on('error', function(e) {
        console.log(e);
        req.abort();
    })
    
    req.on('timeout', () => {
        console.log('timeout')
        req.abort();
    });
    
    req.end();
    
}

