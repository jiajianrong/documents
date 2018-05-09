nodejs是单进程单线程的，为了充分利用多核CPU我们必须创建多个node进程并对其负载。通常有三种方式：

- node的cluster模块：一个master进程监听端口，将请求分发到worker进程群
- linux的iptables：使用预设路由，将请求转发到nodejs的不同进程（这些进程各自监听不同端口）
- nginx反向代理：将请求传递到nodejs的不同进程（这些进程各自监听不同端口）


## 历史回顾

2012年nodejs v0.8版本增加了内置的cluster模块，用以创建一个master进程并负载worker进程。最初cluster的实现方式是让操作系统自行决定如何负载。2015年Ben承认该方式有问题：

> 操作系统自行负载的方式，出乎人们的预料，特别在Linux和Solaris系统上，大部分的请求最终仅分发给了2-3个进程 — [Ben Noordhuis](https://strongloop.com/strongblog/whats-new-in-node-js-v0-12-cluster-round-robin-load-balancing/)


因此nodejs v0.12版本修改了负载方式，引入了一种round-robin算法。自从nodejs v6.0.0以后该方式就成为默认方式。

> master进程监听端口，接受请求，并以round-robin的方式将之传递给worker进程执行。 — [Node 6.0.0 cluster module documentation](https://nodejs.org/api/cluster.html#cluster_how_it_works)




## cluster实现

cluster.js

	class Cluster {
	  constructor () {
	    if (cluster.isMaster) {
	      this.fork()
	    }
	    else {
	      new Worker()
	    }
	  }
	
	  fork () {
	    let cpus = os.cpus().length
	
	    for (let i = 0; i < cpus; i++) {
	      cluster.fork({id: i})
	    }
	  }
	}
	
	new Cluster()



cluster-worker.js

	let id
	
	class Worker {
	  constructor () {
	    id = Number(process.env.id)
	    this.webserver()
	  }
	  
	  webserver () {
	    let server = http.createServer((req, res) => {
	      res.writeHead(200)
	      res.end('ok')
	    }).listen(80, () => {
	      console.log('Worker', id, 'listening on port', server.address().port)
	    })
	  }
	}
	
	module.exports = Worker



## iptables/nginx实现

iptables.js
	
	class Iptables {
	  constructor () {
	    this.fork()
	  }
	
	  fork (id) {
	    let cpus = os.cpus().length
	
	    for (let i = 0; i < cpus; i++) {
	      cp.fork('./iptables-worker', {env: {id: i}})
	    }
	  }
	}
	
	new Iptables()



iptables-worker.js

	let id
	
	class Worker {
	  constructor () {
	    id = Number(process.env.id)
	    this.webserver()
	  }
	
	  webserver () {
	    let server = http.createServer((req, res) => {
	      res.writeHead(200)
	      res.end('ok')
	    }).listen(8080 + id, () => {
	      console.log('Worker', id, 'listening on port', server.address().port)
	    })
	  }
	}
	
	new Worker()



## 副作用

使用Nginx时文件描述符会多一倍：一个用于用户请求，另一个用于nodejs server进程。这会增加一些内存使用。


*[转自](https://medium.com/@fermads/node-js-process-load-balancing-comparing-cluster-iptables-and-nginx-6746aaf38272)*