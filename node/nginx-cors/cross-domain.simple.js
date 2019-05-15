let http = require('http')

// 8787端口的html页面上的ajax请求(简单请求)  请求8788的服务器
var html = `
    <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Cross-domain-test</title>
        </head>
        <body>
            <div>Cross-domain-test</div>
            <script>
                fetch('http://localhost:8788', {
                    method: "get",
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        //'Content-Type': 'application/json',
                    },
                })
                //.then(response => response.json())
                .then(console.log)
                .catch(console.log)
            </script>
        </body>
    </html>
`

http.createServer(function(req, res) {
    res.end(html)
}).listen(8787);

http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8787");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    res.end("{'code':8788}")
}).listen(8788);