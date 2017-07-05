# 深入Node debug - 步骤及原理


旧版本的nodejs可以使用[node-inspector](https://github.com/node-inspector/node-inspector)或其他工具如VS或webstorm，不在本文讨论范围之内。

nodejs自带debug console界面(`node inspect your_file.js`或`node-inspect your_file.js`)实在太难用，也不在本文讨论范围之内。

如果你的nodejs版本为6.4+，并且Chrome为57+，恭喜你，你无需借助或安装任何额外程序或工具，只需如下两步即可轻松调试node代码


###### Step 1 - 启动debugging，默认debug端口号为9229

	node --inspect-brk your_file.js
	
###### Step 2 - 打开Chrome，地址栏输入 `chrome://inspect/#devices`

在页面中点击"Open dedicated DevTools for Node"，即可启动debug




## 更改端口号


debugging端口号默认为9229，你也可以使用其他端口号，如9222

	node --inspect-brk=9222 your_file.js

Chrome默认会监听9229端口。如需监听其他端口，点击"Configure..."按钮可添加。那么问题来了，什么情况下需要更改端口呢？




## 原理


回答上面的问题首先需要了解一点nodejs的调试原理，当我们使用了 `node --inspect-brk` 执行某个js文件时，
node进程会通过websocket自动监听`127.0.0.1:9229`这一端口(即node进程做为socket server)，
并且该进程会被分配一个UUID，如`ca4c2601-aef6-4be3-b699-f5de5030384f`。


debug工具(不管是chrome devtool还是node-inspector还是webstorm等等)，必须知道地址、端口、以及UUID。
然后使用socket(做为socket client)和上述进程通讯。如下：

	C:\Users\58\Desktop>node --inspect-brk=9222 parent.js
	Debugger listening on ws://127.0.0.1:9222/ca4c2601-aef6-4be3-b699-f5de5030384f

debug工具通常还会提供一个http服务显示被debug进程的metadata， `http://[host:port]/json/list`

在我的例子中访问`http://localhost:9222/json/list`，返回

	[ {
	  "description": "node.js instance",
	  "devtoolsFrontendUrl": "chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9222/ca4c2601-aef6-4be3-b699-f5de5030384f",
	  "faviconUrl": "https://nodejs.org/static/favicon.ico",
	  "id": "ca4c2601-aef6-4be3-b699-f5de5030384f",
	  "title": "parent.js",
	  "type": "node",
	  "url": "file://C:_Users_58_Desktop_parent.js",
	  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/ca4c2601-aef6-4be3-b699-f5de5030384f"
	} ]

由此可见，一个debug实例只能和一个socket server(即被debug的进程)通讯。
那如果我的nodejs程序中启动了新的node进程(比如使用child_process.fork)呢？
	

	

## debug多个进程 或 仅debug子进程

在父进程里使用spawn或者fork都可以启动debug子进程*(注：spawn默认不pipe子进程输出流，需要手动处理)*

###### spawn写法
	
	spawn('node', ['--inspect-brk=9222', './child.js']).stdout.pipe(process.stdout)
	// 或者
	spawn('node', ['--inspect-brk=9222', './child.js'], {stdout: [0,1,2]})


###### fork写法

	fork( './child.js', [], {execArgv: ['--inspect-brk=9222']} ).disconnect();







*参考:[nodejs doc](https://nodejs.org/en/docs/guides/debugging-getting-started/)，转载请注明来自58金融前端团队*






























































































































































