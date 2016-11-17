# 深入理解Node多线程(多进程)原理2 - cluster #


在[上一节]() 我们分析了node child_process，本节将介绍node cluster模块



## cluster ##

先来看官方上最经典的例子

    const cluster = require('cluster');
    const http = require('http');
    const numCPUs = require('os').cpus().length;
    
    if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
    	cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
    	console.log(`worker ${worker.process.pid} died`);
    });
    } else {
    	// Workers can share any TCP connection
    	// In this case it is an HTTP server
    	http.createServer((req, res) => {
    		res.writeHead(200);
    		res.end('hello world\n');
    	}).listen(8000);
    }

多个工作进程共同监听8000端口，其本质还是上节讲的 child_process.fork()

cluster支持两种分发连接的方式：

- 在除Windows系统之外的所有其他系统上，使用上节所提到的round-robin算法：主进程监听端口，接受socket连接并将之平均分配给所有子进程
- 在Windows系统上，主进程创建server，直接把server本身发给子进程。这么一来子进程直接接受socket连接，和主进程无关了（当然也就不能负载均衡）

两种方式的具体分析和demo上一节已经讲述的很清楚了，这里不做介绍。



## stateless ##

值得注意的是，子进程之间天生就无法分享数据。所以我们写程序时，除非必须，最好不要写出依赖如session和login之类的进程内存数据的逻辑。

这里解析一下，假设webserver由一个主进程和四个子进程构成，主进程用以给子进程分发连接，以及管理子进程状态（如监听内存使用大小等）。
如果有某个用户访问登录页面并提交了post请求登录，主进程接受到该请求并将之分发到子进程A。子进程A在session里设置该用户isLogin=true，代表已登录。

然后该用户又访问某个需要登录后才能访问的页面，这次主进程接受到该请求并将之分发子进程B。子进程B并不知道用户在子进程A用已经登录了。所以又会把用户请求302到登录页。

保证业务逻辑都是stateless，即session无关，才能方便将请求的处理逻辑扩展到不同进程，甚至不同主机。

上述问题的解决办法最好是在进程之外的第三方主体里处理，如将用户登录信息写入文件或数据库，以保证所有进程都能够访问和更改到。当然现在的主流解决办法是用内存缓存如redis代替文件或数据库，性能更佳。




## 拆分cluster ##

官方的例子把master和worker的逻辑都混在cluster.js里了，其实可以拆分如下

cluster_demo_master_only.js
    
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    
    if (cluster.isMaster) {
    	console.log("start master...");
    	
    	for (var i = 0; i < numCPUs; i++) {
     		cluster.fork();
    	}
    
    	cluster.on('listening', function (worker, address) {
    		console.log(`master listening: worker ${worker.id}, pid ${worker.process.pid}, Address ${address.address} ${address.port}`);
    	});
    
    } else if (cluster.isWorker) {
    	require('./cluster_demo_worker_only.js');
    }


cluster_demo_worker_only.js

    var http = require('http');
    
    http.createServer(function(req, res){
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end(`Hello world`);
    	
    	console.log(process.pid)
    	// for(var i=0;i<10000000000;i++) var j=i+1;
    
    }).listen(8888, '127.0.0.1');


拆分之后的逻辑显得很清晰。

注：在Windows下，几乎每次访问都会打印相同的pid，原因是因为Windows系统下子进程是靠抢连接的，最快的子进程几乎永远都是最快的。

取消注释，让抢到连接的子进程执行一个很慢的同步操作，结果下一个连接来的时候该子进程还没有计算完毕，只能"让"给其他子进程了。



## node cluster子进程之间的通讯 ##

Node不支持子进程之间通讯，如确实需要的话，只能通过父进程中转（类似Vue框架中的子组件先dispatch到父，父再broadcast到所有子）

cluster_demo_master_only_communicate.js
    
    var cluster = require('cluster');
    
    if (cluster.isMaster) {
    	console.log("start master...");
    	
    	for (var i = 0; i < 4; i++) {
     		cluster.fork();
    	}
    	
    	cluster.on('listening', function (worker, address) {
    		console.log(`master listening: worker ${worker.id}, pid ${worker.process.pid}, Address ${address.address} ${address.port}`);
    	});
    	
    	// 在父进程里为每个子进程都注册监听事件，如此当某个子进程在其自身process.send时，
		// 确保父进程可以监听到，然后再派发给所有子进程
    	Object.keys(cluster.workers).forEach((id) => {
    		cluster.workers[id].on('message', function(msg){
    			Object.keys(cluster.workers).forEach((id) => {
    				cluster.workers[id].send(msg);
    			});
    			
    		});
    	});
    	
    
    } else if (cluster.isWorker) {
    	require('./cluster_demo_worker_only_communicate.js');
    }
    

cluster_demo_worker_only_communicate.js

    var http = require('http');
    
    http.createServer(function(req, res){
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end(`Hello world`);
    	
    	console.log(process.pid)
    	process.send(`worker ${process.pid} get request!`);
    	
    	// for(var i=0;i<10000000000;i++) var j=i+1;
    }).listen(3002, '127.0.0.1');
    
    process.on('message', (msg)=>{
    	console.log(`worker ${process.pid} get message: ${msg}`)
    })




## 另一种写法 ##

朴灵在《深入浅出nodejs》推荐另外一种创建cluster的方式如下。省去了if isMaster或if isWorker的判断。

cluster.js

	var cluster = require('cluster');
	
	cluster.setupMaster({
		exec: 'worker.js'
	})
	
	cluster.fork();
	cluster.fork();
	cluster.fork();
	cluster.fork();


worker.js

	var http = require('http');
	
	http.createServer(function(req, res){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Hello world\n');
	}).listen(80, '127.0.0.1');



有关cluster的介绍结束了，可以看出基本就是child_process.fork()的略微包装，没有监控工具也没有日志。如果某个worker因异常而终止了也不会重启。
所以cluster在实际使用中并不常用，接下来一节简单介绍更为常用的管理node进程的工具 - pm2

*58金融前端团队原创，转载请标注*






















