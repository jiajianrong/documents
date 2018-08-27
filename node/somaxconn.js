const http = require('http');

const allRemotePorts = new Set();

const SOCKET_POOL = new http.Agent({
    keepAlive: false,
    keepAliveMsecs: 1000,
    maxSockets: 200,
    maxFreeSockets: 10,
});



http.createServer(function(req, res){
    allRemotePorts.add(req.connection.remotePort)
    res.end('{"code":0}')
}).listen(9900, 2048); // net.core.somaxconn也应大于2048



setTimeout( function(){
    for(let i=0;i<2000;i++) { request(); }
}, 1000 )
setTimeout( function(){
    console.log(allRemotePorts.size);
}, 5000 )



function request() {
    return new Promise((resolve, reject) => {
        const option = {
            protocol: 'http:',
            host: 'localhost',
            port: 9900,
            path: '/',
            agent: false,
            method: 'GET',
            //agent: SOCKET_POOL,
        };


        const req = http.request(option, function(res) {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body)
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            console.error(e.stack)
            console.log(allRemotePorts.size);
            process.exit(1)
        });


        req.end();
    })
}



