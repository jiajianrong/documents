const http = require('http');


const sleep = (n) => {
    return new Promise(resolve=>{
        setTimeout( ()=>resolve(), n )
    })
}


/**
 * ����server��ÿ������hold 3����Ӧ
 **/

const server = http.createServer(function (req, res) {
    sleep(3000).then(()=>{
        res.end('Hello World\n');
    })
}).listen(8000);


sleep(1000).then(request)


/**
 * ����request������timeoutΪ2��
 * �ᴥ��request��timeout event
 * ��Ҫ�ֶ�����abort
 * abortʱ���׳�socket hang up������error event
 *
 * �������
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

