# Nodejs的模块加载：一切你需要了解的都在这里 #

Nodejs使用两个核心模块来管理模块依赖：

- 作用在全局作用域上的require模块；
- 作用在全局作用域上的module模块；

加载一个模块很简单：

    const config = require('/path/to/file');


require模块暴露出来的对象是一个function。当把本地文件路径当参数，调用require()时，nodejs执行顺序如下：

- Resolving: 查找文件绝对路径
- Loading: 确认文件类型
- Wrapping: 作用域包裹。把require和module对象私有化到每一个被require的文件
- Evaluating: VM执行装载
- Caching: 下次再require同文件时，避免再次执行上述步骤


本文将解释这些不同的步骤。



## Resolving一个本地路径 ##

我们先使用REPL了解module对象：

    C:\Users\58>node
    > module
    Module {
      id: '<repl>',
      exports: {},
      parent: undefined,
      filename: null,
      loaded: false,
      children: [],
      paths:
       [ 'C:\\Users\\58\\repl\\node_modules',
         'C:\\Users\\58\\node_modules',
         'C:\\Users\\node_modules',
         'C:\\node_modules',
         'D:\\node\\node-global\\node_modules',
         'C:\\Users\\58\\.node_modules',
         'C:\\Users\\58\\.node_libraries',
         'C:\\Program Files\\lib\\node' ] }
    >

每一个module对象有一个id属性，通常是文件的全路径。但是在REPL里仅仅是<repl>

Nodejs的module是和一个文件严格一一对应，我们require一个module时会把他对应的文件内容装入内存。

不过既然nodejs有多种require文件的方式（如相对路径和预配置路径），我们需要先找到文件的绝对路径。

当加载无路径的'find-me'模块时

    require('find-me');

Nodejs会依次在下面目录里查找find-me.js

    > module.paths
    [ 'C:\\Users\\58\\repl\\node_modules',
      'C:\\Users\\58\\node_modules',
      'C:\\Users\\node_modules',
      'C:\\node_modules',
      'D:\\node\\node-global\\node_modules',
      'C:\\Users\\58\\.node_modules',
      'C:\\Users\\58\\.node_libraries',
      'C:\\Program Files\\lib\\node' ]
    >


这个列表基本上就是从当前路径下的node_modules目录，一直上寻至根路径的node_modules目录。除此之外还包含一些不被推荐的历史遗留路径。

如果nodejs在上述路径下都没有找到find-me.js，它会扔出“cannot find module error”

    > require('find-me')
    Error: Cannot find module 'find-me'
	    at Function.Module._resolveFilename (module.js:325:15)
	    at Function.Module._load (module.js:276:25)
	    at Module.require (module.js:353:17)
	    at require (internal/module.js:12:17)
	    at repl:1:1
	    at REPLServer.defaultEval (repl.js:262:27)
	    at bound (domain.js:287:14)
	    at REPLServer.runBound [as eval] (domain.js:300:12)
	    at REPLServer.<anonymous> (repl.js:431:12)
	    at emitOne (events.js:82:20)
    >



如果你创建一个node_modules目录然后再在里面创建find-me.js

    C:\Users\58>mkdir node_modules
    C:\Users\58>echo console.log(11111)>node_modules/find-me.js
    C:\Users\58>node
    > require('find-me')
    11111
    {}
    >


如果在其他路径里存在另外一个find-me.js文件，如在根目录下存在一个node_modules目录，里面有find-me.js

    C:\>mkdir node_modules
    C:\>echo console.log(2222)>node_modules/find-me.js

当我们在拥有node_modules/find-me.js的目录下执行require('find-me')时，根目录里的find-me.js不会被加载

    C:\Users\58>
    C:\Users\58>node
    > require('find-me')
    11111
    {}

如果我们删除了本地路径下的node_modules/find_me.js文件，再去加载find-me，此时根目录下的node_modules/find-me.js将会被加载使用

    C:\Users\58>rm -r node_modules
    C:\Users\58>node
    > require('find-me')
    2222
    {}
    >



## Requiring一个目录 ##

Module不一定非得是文件。我们也可以在node_module目录下创建一个find-me目录，并且放置index.js在里面。require('find-me')将会使用该目录下的index.js文件

    C:\Users\58>mkdir "node_modules/find-me"
    C:\Users\58>echo console.log(333)>./node_modules/find-me/index.js
    C:\Users\58>node
    > require('find-me')
    333
    {}
    >


当require目录时，index.js是其加载的默认文件名。我们可以使用package.json里的main属性来改变它。例如把默认加载的文件改为start.js

    C:\Users\58>echo console.log(444)>./node_modules/find-me/start.js
    C:\Users\58>echo {"main":"start.js"}>./node_modules/find-me/package.json
    C:\Users\58>node
    > require('find-me')
    444
    {}


如果仅仅想找到module而不是执行它，可以使用require.resolve方法。该方法并不会加载文件内容，只是返回文件全路径

    C:\Users\58>node
    > require.resolve('find-me')
    'C:\\Users\\58\\node_modules\\find-me\\start.js'



## 相对路径和绝对路径 ##

除了从node_modules中加载module，我们还可以使用相对路径 ./ 和 ../ 或绝对路径 / 来加载

例如，find-me.js是在libs目录下而非node_modules下，我们可以

    require('./lib/find-me');



## exports,module.exports,和同步加载module ##

在任何一个module里，exports都是一个特殊对象。每次我们打印module对象时都会有一个exports属性。我们可以给index.js赋值exports

index.js

    exports.id = 'index_id'
    console.log(module)

执行

    C:\Users\58\node_modules\find-me>node index.js
    Module {
      id: '.',
      exports: { id: 'index_id' },
      parent: null,
      filename: 'C:\\Users\\58\\node_modules\\find-me\\index.js',
      loaded: false,
      children: [],
      paths:
       [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
     'C:\\Users\\58\\node_modules',
     'C:\\Users\\node_modules',
     'C:\\node_modules' ] }


也可以替换exports对象：

	module.exports = function() {};

需注意我们不能使用 `exports=function(){}` 来设置exports对象。因为exports变量仅仅是module.exports的引用。当exports被设置时，仅仅是引用更新，而非更新module.exports


接下来我们来看module对象的loaded属性。Module使用该属性来记录是否module已经被加载过了(true)，loaded为false则代表module正在被加载。

index.js

    exports.id = 'index_id'
    console.log(module)
    setImmediate( ()=> console.log(module) )

执行结果：

	C:\Users\58\node_modules\find-me>node index.js
	Module {
	  id: '.',
	  exports: { id: 'index_id' },
	  parent: null,
	  filename: 'C:\\Users\\58\\node_modules\\find-me\\index.js',
	  loaded: false,
	  children: [],
	  paths:
	   [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
	     'C:\\Users\\58\\node_modules',
	     'C:\\Users\\node_modules',
	     'C:\\node_modules' ] }
	Module {
	  id: '.',
	  exports: { id: 'index_id' },
	  parent: null,
	  filename: 'C:\\Users\\58\\node_modules\\find-me\\index.js',
	  loaded: true,
	  children: [],
	  paths:
	   [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
	     'C:\\Users\\58\\node_modules',
	     'C:\\Users\\node_modules',
	     'C:\\node_modules' ] }


当nodejs完成module的加载，exports对象就可以使用了。整个requiring/loading模块是同步的。所以在一个event loop后，module对象就是loaded状态了。



## 循环依赖的module ##

如果module1 require module2，而module2又require module1，会发生什么呢？

我们先创建module1.js和module2.js

lib/module1.js

	exports.a = 1;
	require('./module2');
	exports.b = 2;
	exports.c = 3;

lib/module2.js

	const Module1 = require('./module1');
	console.log('Module1 is partially loaded here', Module1);

执行结果：

	C:\Users\58\node_modules\find-me>node ./libs/module1
	Module1 is partially loaded here { a: 1 }
	
	C:\Users\58\node_modules\find-me>


我们在module1全部加载之前require了module2，同时因为module2 require了module1，我们此时得到的module1的exports是不完整的：只有a属性

Nodejs选择最简单的方式。在loading一个module的过程中，nodejs创建了其exports对象。你可以在module loading完成之前，在其他module中require这个module。你会得到一个“非完整版的”exports。



## JSON and C/C++ addons ##

Nodejs能够使用require方法加载原生json文件及C++插件，甚至都无需指定文件后缀。

如果文件后缀没有指定，nodejs会先尝试加载.js文件，找不到的话会尝试加载.json并以json格式解析。还找不到的话会加载二进制.node文件。不过如果不是.js文件的话，还是最好写清楚后缀。

Require json的例子：

config.json文件内容如下

	{
	  "host": "localhost",
	  "port": 8080
	}

我们可以这样加载

	const { host, port } = require('./config');
	console.log(`Server will run at http://${host}:${port}`);

结果打印

	Server will run at http://localhost:8080


如果nodejs找不到.js和.json，它会尝试找.node，并按照编译好的插件模块解析。[官方范例]( https://nodejs.org/api/addons.html#addons_hello_world)


事实上我们可以通过require.extensions查看这三种后缀的解析方式
	
	> require.extensions['.js'].toString()
	'function (module, filename) {\n  var content = fs.readFileSync(filename, \'utf8
	\');\n  module._compile(internalModule.stripBOM(content), filename);\n}'
	> require.extensions['.json'].toString()
	
	'function (module, filename) {\n  var content = fs.readFileSync(filename, \'utf8
	\');\n  try {\n    module.exports = JSON.parse(internalModule.stripBOM(content))
	;\n  } catch (err) {\n    err.message = filename + \': \' + err.message;\n    th
	row err;\n  }\n}'
	
	> require.extensions['.node'].toString()
	'function (module, filename) {\n  return process.dlopen(module, path._makeLong(f
	ilename));\n}'



## 所有的nodejs代码都会被包裹在方法里 ##

当编译一个module时，nodejs把module代码都包裹在一个function中。我们可以使用module的wrapper属性查看

	> require('module').wrapper
	[ '(function (exports, require, module, __filename, __dirname) { ',
	  '\n});' ]


Nodejs没有直接执行module里的代码。它先用wrapper把代码包起来，然后执行。这样就使得代码里声明的变量附加到module作用域上，不会污染全局

wrapper方法有五个形参：`exports, require, module, __filename, __dirname`。因此它们看上去像是global，但其实不是。

既然所有的module都在方法里，完全可以使用arguments来访问形参

	C:\Users\58\node_modules\find-me>echo console.log(arguments)>show_args.js
	
	C:\Users\58\node_modules\find-me>node show_args.js
	{ '0': {},
	  '1':
	   { [Function: require]
	     resolve: [Function],
	     main:
	      Module {
	        id: '.',
	        exports: {},
	        parent: null,
	        filename: 'C:\\Users\\58\\node_modules\\find-me\\show_args.js',
	        loaded: false,
	        children: [],
	        paths: [Object] },
	     extensions: { '.js': [Function], '.json': [Function], '.node': [Function] }
	,
	     cache: { 'C:\Users\58\node_modules\find-me\show_args.js': [Object] },
	     registerExtension: [Function] },
	  '2':
	   Module {
	     id: '.',
	     exports: {},
	     parent: null,
	     filename: 'C:\\Users\\58\\node_modules\\find-me\\show_args.js',
	     loaded: false,
	     children: [],
	     paths:
	      [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
	        'C:\\Users\\58\\node_modules',
	        'C:\\Users\\node_modules',
	        'C:\\node_modules' ] },
	  '3': 'C:\\Users\\58\\node_modules\\find-me\\show_args.js',
	  '4': 'C:\\Users\\58\\node_modules\\find-me' }

第一个形参是空的exports对象；接下来是require和module对象，它们都被以show_args.js文件实例化；最后两个是文件路径和所在目录路径

Wrapping方法返回的值是module.exports，大体上相当于

	function (require, module, __filename, __dirname) {
	  let exports = module.exports;
	  // Your Code...
	  return module.exports;
	}



## Require对象 ##

Require对象一般作为一个方法，接受module名称或路径，返回module.exports对象

Require对象也有自己的属性和方法，比如前面的resolve方法，extensions属性，以及main属性（用来判断当前module是被require还是直接被nodejs执行，main为true代表直接被node执行而非被其他模块require）



## 所有的module都会被缓存 ##

	C:\Users\58\node_modules\find-me>echo console.log('printjs')>print.js
	C:\Users\58\node_modules\find-me>echo console.log('printjs')>print.js
	C:\Users\58\node_modules\find-me>echo require('./print.js');require('./print.js')>main.js
	C:\Users\58\node_modules\find-me>node main.js
	printjs

可以发现第二个require并没有打印内容，因为print.js已经被缓存了。我们可以打印require.cache确认。

	C:\Users\58\node_modules\find-me>echo require('./print.js');console.log(require.cache);require('./print.js')>main.js
	C:\Users\58\node_modules\find-me>node main.js
	printjs
	{ 'C:\Users\58\node_modules\find-me\main.js':
	   Module {
	     id: '.',
	     exports: {},
	     parent: null,
	     filename: 'C:\\Users\\58\\node_modules\\find-me\\main.js',
	     loaded: false,
	     children: [ [Object] ],
	     paths:
	      [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
	        'C:\\Users\\58\\node_modules',
	        'C:\\Users\\node_modules',
	        'C:\\node_modules' ] },
	  'C:\Users\58\node_modules\find-me\print.js':
	   Module {
	     id: 'C:\\Users\\58\\node_modules\\find-me\\print.js',
	     exports: {},
	     parent:
	      Module {
	        id: '.',
	        exports: {},
	        parent: null,
	        filename: 'C:\\Users\\58\\node_modules\\find-me\\main.js',
	        loaded: false,
	        children: [Object],
	        paths: [Object] },
	     filename: 'C:\\Users\\58\\node_modules\\find-me\\print.js',
	     loaded: true,
	     children: [],
	     paths:
	      [ 'C:\\Users\\58\\node_modules\\find-me\\node_modules',
	        'C:\\Users\\58\\node_modules',
	        'C:\\Users\\node_modules',
	        'C:\\node_modules' ] } }

可以删除该cache对象所对应的key值，以达到重新加载module的目的。

当然最好的办法是在print.js里返回一个function，在main里调用该function，这样就可以彻底避免module缓存

	require('./print.js');
	delete require.cache['C:\\Users\\58\\node_modules\\find-me\\print.js']
	require('./print.js')



*[译自freecodecamp](https://medium.freecodecamp.com/requiring-modules-in-node-js-everything-you-need-to-know-e7fbd119be8)，转载请注明来自58金融前端团队*





