# 深入理解Node多进程(多线程)原理1 - child_process #




node进程本身，包括Express server，从开发人员的角度是单进程单线程的，所有的工作和计算能力都在同一process/thread里。若有相对很慢的IO请求，如读文件，则使用监听-回调的异步方式交互。

这种机制很适合处理高并发的请求，因为CPU没有切换线程的开销。但不适合计算量大的任务。

比如request需要大量计算才能response，假设每个需要100ms，因为是单进程单线程，所以Express server在此时间什么都干不了。此情形下使用Java类似的多线程比较合适，可以利用多余的CPU处理计算逻辑。本文将讲述Node如何利用多进程实现同样功能。


## child_process ##

所幸的是Node提供了`child_process`模块引入多进程机制。

- child_process.spawn(), 
- child_process.fork(), 
- child_process.exec(), 
- child_process.execFile()

这四个方法都返回一个继承自EventEmitter的子进程实例。所以父进程可以很方便的在子进程的某些生命周期的事件点上注册listener监听器。spawn，exec和execFile主要是用来执行命令的，不在本文讨论范围（其实fork底层也是spawn的一种变形）。


## child_process.fork ##

fork返回的子进程在底层上使用IPC和父进程通讯，具体如下：

在父进程里调用child.on监听子进程传来的数据，调用child.send向子进程发送数据

    child.on('message', fn)
    child.send(...)

在子进程里调用process.on监听上面代码传来的数据，调用process.send向父进程监听的listener发送数据

    process.on('message', fn)
    process.send(...)

这里需要特别指出，除了可以互相通讯，父子进程完全无关系。他们都独立运行在自己的V8实例上。

来看一个最简单的进程创建+通讯 demo：在父进程里使用fork创建一个子进程。并与之通讯。

parent.js

    var child_process = require('child_process');
    var child = child_process.fork('child.js');
    
    child.on('message',function(data){
        console.log(data);
    });
    child.send("hi child");
    child.send("hi child, again");


child.js

    process.on('message',function(data){
        console.log(`${data}`);
    });
    process.send("hello parent");



具体对应到http server逻辑，下面代码抄自朴灵《深入浅出nodejs》（深度好书，强烈推荐）

master.js

    var fork = require('child_process').fork;
    for(var i=0; i<4; i++) {
    	fork('./worker.js');
    }

worker.js

    var http = require('http');
    http.createServer(function(req, res){
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.end('Hello world\n');
    }).listen(Math.round((1+Math.random())*1000), '127.0.0.1');

主进程创建四个子进程，每个子进程都是一个httpserver，监听一个1000至2000的随机端口。
所以执行node master.js后应该有总共五个node进程（如果出错了重新run一下，说明随机端口重复了）



## 句柄（socket）传递和监听同一端口 ##

上述代码的不足在于多个子进程的httpserver监听多个不同的端口。如何让他们都监听同一端口，如80端口呢？

进程之间除了传递数据，还可以传递句柄（这里具体就是指socket。socket属于较为底层的TCP传输层，而http属于最高层的应用层）

master_tcp_socket.js

    var worker = require('child_process').fork('worker_tcp_socket.js');
    var server = require('net').createServer();
    server.listen(3001, function(){
    	worker.send(null, server); // server即是句柄
    })

worker_tcp_socket.js

    process.on('message', function(p1, server){
    	server.on('connection', function(socket){
    		socket.end('this is worker\n');
    	})
    })

如此即可轻松实现父进程向子进程派发server句柄。如此即实现里主进程master把任务工作"委托"给子进程worker。接下来的改进生成多个worker，实现"一起监听"80端口。

master_tcp_socket_more_workers.js

    var worker_1 = require('child_process').fork('worker_tcp_socket_more_workers.js');
    var worker_2 = require('child_process').fork('worker_tcp_socket_more_workers.js');
    var server = require('net').createServer();
    server.listen(80, function(){
    	worker_1.send(null, server);
    	worker_2.send(null, server);
    	server.close();
    })

worker_tcp_socket_more_workers.js

    process.on('message', function(p1, server){
    	var id = Math.random(); // 为不同子进程创建了不同的随机id
    	server.on('connection', function(socket){
    		socket.end(`this is worker ${id}\n`);
    	})
    })

需要注意的是上面代码里的子进程是抢占式的，只有一个能抢到连接。显然达不到负载均衡的效果。



## 负载均衡 ##

cluster以及大名鼎鼎的pm2默认是使用round-robin算法实现负载均衡，其实特别简单，就是一个数组循环使用。

round-robin模拟实现逻辑

    var workers = {
    	queue: [],
    	current: 0,
    	// init方法仅仅生成子进程数组，这里我们用{id: , send:}对象模拟
    	init: function(count) {
    		for(i=0; i<count; i++) {
    			var w = {id: i, 
    					 send: function(s){
    						console.log(`worker ${this.id} send ${s}`)
    					 }}
    			this.queue.push(w);
    		}
    	},
    	// 每次take任务时，使用当前数组下标，然后下标++
    	take: function(server) {
    		this.queue[this.current++].send(server);
    		if (this.current==this.queue.length) this.current = 0;
    	}
    }
    
    // 调用逻辑
    workers.init(3);
    workers.take('a')
    workers.take('b')
    workers.take('c')
    workers.take('d')
    workers.take('e')
    workers.take('f')
    workers.take('g')
    workers.take('h')
    workers.take('i')


理解了负载均衡算法之后，我们将之前的父进程改进一下，使用该算法

master_tcp_socket_more_workers_with_round_robin.js

    var workers = [];
    for (var i=0; i<3; i++) {
       workers.push( require('child_process').fork('worker_tcp_socket_more_workers_with_round_robin.js') );
    }
    
    console.log( 'following process ids created: ', workers[0].pid, workers[1].pid, workers[2].pid)
    
    var server = require('net').createServer();
    server.listen(8080)
    
    
    var count=0
    var all = ''
    
    server.on('connection', function(socket){
    	var worker = workers.shift();	
    	
    	var desc = `request  ${count++} handled by process: ${worker.pid}\n`
    	all += desc
    	console.log(desc);
    	
    	// 为了简化代码，使用更改数组对象的方式实现轮询
    	// 生成环境中不建议这么做
    	worker.send(all, socket);
    	workers.push(worker);
    })


worker_tcp_socket_more_workers_with_round_robin.js

    process.on('message', function(p1, server){
    	server.end(p1);
    })


执行node master_tcp_socket_more_workers_with_round_robin.js之后用浏览器访问8080端口，可见每次请求都会被三个子进程依次执行


## 被忽略的细节 ##

细心的同学一定会发现这里的子进程逻辑和之前的不一样，没有了server.on('connection', fn)监听回调。 这是因为之前我们把父进程里的server自身发给了子进程，所以要在子进程里自己监听端口，注册回调。 而现在我们的父进程自身监听server的connection事件，子进程只获得父进程派发的socket连接请求，所以子进程里直接调用socket write或end方法即可。


由此可见，实现round-robin算法负载均衡的父进程，和由子进程互相抢夺句柄的核心不同在于，

- 前者由父进程维护子进程队列，轮询出一个子进程，然后把socket句柄塞给他；
- 后者父进程直接把自身的server句柄塞给随机一个抢夺站中胜出的幸运儿子进程。


## More ##

如果您已经阅读到此处，相信一定对Node的多进程机制原理有深刻理解了。劳驾高抬贵手star一下，然后我们继续深入[下一节cluster](https://github.com/jiajianrong/documents/blob/master/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3Node%E5%A4%9A%E7%BA%BF%E7%A8%8B(%E5%A4%9A%E8%BF%9B%E7%A8%8B)%E5%8E%9F%E7%90%862%20-%20cluster.md)，以及pm2这俩个常被用到类库，了解他们的使用场景和缺点。


*58金融前端团队原创，转载请标注*

