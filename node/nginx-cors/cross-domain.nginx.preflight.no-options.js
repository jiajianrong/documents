let http = require('http')

// 8787端口的html页面上的ajax请求(复杂请求)  请求8789的nginx，nginx代理到8788服务器
// 其中8788服务器不支持options方法，需要在nginx层屏蔽
/*
nginx配置需处理options请求
upstream  port8788 {
    server   127.0.0.1:8788;
}
server {
    listen       8789;
    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://localhost:8787';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Credentials' 'true';
            #
            # Custom headers and headers various browsers *should* be OK with but aren't
            #
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            #
            # Tell client that this pre-flight info is valid for 20 days
            #
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
         }
        proxy_pass   http://port8788;
    }
    ...
}
*/

var html = `
    <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Cross-domain-test</title>
        </head>
        <body>
            <div>Cross-domain-test</div>
            <script>
                fetch('http://localhost:8789', {
                    method: "get",
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        //'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Type': 'application/json',
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