const http = require('http')

const sleep = (n) => {
    return new Promise(resolve=>{
        setTimeout( ()=>resolve(), n )
    })
}

const POOL = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 20000,
    maxFreeSockets: 200,
})


var set = new Set()
var arr = []


/**
 * 创建request，使用keep-alive header，以及keepalive Agent
 *
 * 每次请求时，将socket的本地端口 分别记录到set和arr中
 **/
function request() {
    
    const req = http.request({
        headers: {Connection: 'keep-alive',},
        hostname:  'gatewaymanager.web.88dns.org',
        path: '/',
        port: 80,
        agent: POOL,
    }, res => {
        //console.log(res.headers)
        //console.log(res.statusCode)
        //console.log(res.socket.localPort)
        set.add(res.socket.localPort)
        arr.push(res.socket.localPort)
        res.on('data', ()=>{})
        res.on('end', ()=>{})
    })
    
    req.on('error', function(e) {
        console.log(e)
    })
    
    req.end();
}


function request_5_times() {
    for (let i=0;i<5; i++) request();
}

// 2000ms内，模拟200个浏览器请求
sleep(0).then(request_5_times)
sleep(50).then(request_5_times)
sleep(100).then(request_5_times)
sleep(150).then(request_5_times)
sleep(200).then(request_5_times)
sleep(250).then(request_5_times)
sleep(300).then(request_5_times)
sleep(350).then(request_5_times)
sleep(400).then(request_5_times)
sleep(450).then(request_5_times)
sleep(500).then(request_5_times)
sleep(550).then(request_5_times)
sleep(600).then(request_5_times)
sleep(650).then(request_5_times)
sleep(700).then(request_5_times)
sleep(750).then(request_5_times)
sleep(800).then(request_5_times)
sleep(850).then(request_5_times)
sleep(900).then(request_5_times)
sleep(950).then(request_5_times)
sleep(1000).then(request_5_times)
sleep(1050).then(request_5_times)
sleep(1100).then(request_5_times)
sleep(1150).then(request_5_times)
sleep(1200).then(request_5_times)
sleep(1250).then(request_5_times)
sleep(1300).then(request_5_times)
sleep(1350).then(request_5_times)
sleep(1400).then(request_5_times)
sleep(1450).then(request_5_times)
sleep(1500).then(request_5_times)
sleep(1550).then(request_5_times)
sleep(1600).then(request_5_times)
sleep(1650).then(request_5_times)
sleep(1700).then(request_5_times)
sleep(1750).then(request_5_times)
sleep(1800).then(request_5_times)
sleep(1850).then(request_5_times)
sleep(1900).then(request_5_times)
sleep(1950).then(request_5_times)
// 1分钟后，模拟5个浏览器请求
sleep(1000*60*1).then(request_5_times)

// 判断端口是否重复
sleep(5000).then(function(){ console.log(set.size, arr.length); })
// print 20 200
sleep(1000*60*1+5000).then(function(){ console.log(set.size, arr.length); })
// print 20 205

