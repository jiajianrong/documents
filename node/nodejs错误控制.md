## Nodejs有四种错误类型：

- 标准ES错误，如 `<EvalError>`, `<SyntaxError>`, `<RangeError>`, `<ReferenceError>`, `<TypeError>`, `<URIError>`
- 系统错误，如读取不存在的文件或向已关闭的socket发数据
- 应用代码里用户自定义级别的错误
- AssertionErrors

所有的错误都是 `<Error>` 的实例


## 异步接口中的错误上报的几种方式

#### callback(err, data)

    const fs = require('fs');
    fs.readFile('a file that does not exist', (err, data) => {
      if (err) {
        console.error('There was an error reading the file!', err);
        return;
      }
      // Otherwise handle the data
    });

#### 提供异步接口的对象如果是一个 `EventEmitter` 的话，Error一般会被路由到该对象的 `error` 事件上

    const net = require('net');
    const connection = net.connect('localhost');

    // Adding an 'error' event handler to a stream:
    connection.on('error', (err) => {
      // If the connection is reset by the server, or if it can't
      // connect at all, or on any sort of error encountered by
      // the connection, the error will be sent here.
      console.error(err);
    });

    connection.pipe(process.stdout);


对于所有的 `EventEmitter` 对象来说，如果 `error` 事件的 `handler` 未提供的话， Error就会被扔出来，导致nodejs进程报告一个未捕获异常并且退出(如果没有注册 `'uncaughtException'` handler的话)。


## Koa的错误处理

Koa应用其实是一个中间件函数的数组，以栈方式串行执行。最基本的错误中间件应该是这样：

    app.use(async function (ctx, next) {
      try {
        // yield downstream
        next();
      } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
      }
    });

你可以在该中间件的下游中间件里throw Error，例如当用户不存在的时候：

    Users.prototype.findByEmail = async function(email) {
      let user = await this.db.findOne({ email: email });
      if (!user) {
        let err = new Error('User not found');
        err.status = 404;
        err.message = `User not found with email: ${email}`;
        throw err;
      }
      return user;
    }


## 继承自 `EventEmitter` 的类的错误处理

未捕获的错误会导致进程退出

	const EventEmitter = require('events');
	const ee = new EventEmitter();
	const http = require('http');
	
	http.createServer(function(req,res){res.end('ok')}).listen(8080)
	
    // 取消注释即可捕获错误，保护进程不退出
	// ee.on('error', e => console.log('err', e.message))
	
	setImmediate(() => {
	  // This will crash the process because no 'error' event
	  // handler has been added.
	  ee.emit('error', new Error('This will crash'));
	});


因此，通常会使用ee.emit扔出异常，然后由 `error` 监听器捕获

	const EventEmitter = require('events');
	const ee = new EventEmitter();
	
	ee.on('event', () => {
	  ee.emit('error', new Error('money needed!'))
	});
	
	ee.on('error', (e) => {
	    console.log('err captured: ', e.message)
	});
	
	ee.emit('event');



*[参考](http://travisjeffery.com/b/2015/10/error-responses-on-node-js-with-koa/)*




























