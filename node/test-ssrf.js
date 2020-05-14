var http = require("http")


http.createServer(function (req, res) {
  res.end('ok')
}).listen(80)


setTimeout(()=>{
    
    
    http.get('http://localhost@baidu.com', (res) => {
      console.log(res.statusCode, res.headers)
    
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      })
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
    
}, 1000)



