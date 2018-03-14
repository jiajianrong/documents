# ES module

本文介绍各种js module，及ES原生module


## AMD

AMD被广泛应用于 `RequireJS` 和 `r.js`


	// polyfill-vendor.js
	define(function () {
	    // polyfills-vendor code
	});
	
	// module1.js
	define(function () {
	    // module1 code
	    return module1;
	});
	
	// module2.js
	define(function (params) {
	    var a = params.a;
	
	    function getA(){
	        return a;
	    }
	
	    return {
	        getA: getA
	    }
	});
	
	// app.js
	define(['PATH/polyfill-vendor'] , function () {
	    define(['PATH/module1', 'PATH/module2'] , function (module1, module2) {
	        var APP = {};
	
	        if(isModule1Needed){
	            APP.module1 = module1({param1:1});
	        }
	
	        APP.module2 = new module2({a: 42});
	    });
	});


## CommonJS

CommonJS使用场景有 `nodejs` 和 `Browserify`。一个显著特点是每个 `module` 都有自己的作用域，避免全局变量的污染


	// polyfill-vendor.js
	    // polyfills-vendor code
	
	// module1.js
	    // module1 code
	    module.exports= module1;
	
	// module2.js
	module.exports= function(params){
	    const a = params.a;
	
	    return {
	        getA: function(){
	            return a;
	        }
	    };
	};
	
	// app.js
	require('PATH/polyfill-vendor');
	
	const module1 = require('PATH/module1');
	const module2 = require('PATH/module2');
	
	const APP = {};
	
	if(isModule1Needed){
	    APP.module1 = module1({param1:1});
	}
	
	APP.module2 = new module2({a: 42});



## ES Modules (Native)

- 互为独立的module作用域(this===undefined)
- module遵守单例模式
- 默认严格模式
- 依赖递归
- 支持代码分割
- 引用后缀须有 `.js`



#### 使用

	<script type="module" scr="PATH/file.js"></script>


	// main.js
	import utils from "./utils.js";
	
	utils.alert(`
	  JavaScript modules work in this browser:
	  https://blog.whatwg.org/js-modules
	`);


	// utils.js
	export default {
	    alert: (msg)=>{
	        alert(msg);
	    }
	};



#### 单例模式

不管引用 `module` 多少次，其始终为同一实例。下面代码只会被执行一次，并且 `counter` 和 `window.counter` 始终为 1

	if(window.counter){
	  window.counter++;
	}else{
	  window.counter = 1;
	}
	
	const counter = window.counter;
	
	export {counter};



#### import声明是静态的

即 不可以在运行时再去动态决定 import 什么内容（注：import函数除外，后续会讲）



#### 加载方式

`module` 文件的加载方式有别于普通js文件

![](https://github.com/jiajianrong/MarkdownPhotos/blob/master/script-loading/js-loading.png)



#### 检测浏览器是否支持 ES-module

	function checkJsModulesSupport() {
	  // create an empty ES module
	  const scriptAsBlob = new Blob([''], {
	    type: 'application/javascript'
	  });
	  const srcObjectURL = URL.createObjectURL(scriptAsBlob);
	
	  // insert the ES module and listen events on it
	  const script = document.createElement('script');
	  script.type = 'module';
	  document.head.appendChild(script);
	
	  // return the loading script Promise
	  return new Promise((resolve, reject) => {
	    // HELPERS
	    let isFulfilled = false;
	
	    function triggerResolve() {
	      if (isFulfilled) return;
	      isFulfilled = true;
	      
	      resolve();
	      onFulfill();
	    }
	
	    function triggerReject() {
	      if (isFulfilled) return;
	      isFulfilled = true;
	
	      reject();
	      onFulfill();
	    }
	
	    function onFulfill() {
	      // cleaning
	      URL.revokeObjectURL(srcObjectURL);
	      script.parentNode.removeChild(script)
	    }
	
	    // EVENTS
	    script.onload = triggerResolve;
	    script.onerror = triggerReject;
	    setTimeout(triggerReject, 100); // reject on timeout
	
	    // start loading the script
	    script.src = srcObjectURL;
	  });
	};
	
	checkJsModulesSupport().then(
	  () => {
	    console.log('ES modules ARE supported');
	  },
	  () => {
	    console.log('ES modules are NOT supported');
	  }
	);




## 将 Webpack Module 重写为 ES native Module

#### 以最常用的 `lodash` 库为例

使用webpack时，我们经常如下引用lodash

	import _ from 'lodash'; 

此时webpack会查找你的 `node_modules` 目录，找到 `lodash` 并且自动加载 `idnex.js` 文件。这个文件会加载 `lodash.js` 类库

你也可以仅引用某个具体功能：

	import map from 'lodash/map';

webpack会查找 `node_modules/lodash/map.js` 并将之加载


OK，webpack加载module就介绍到这，接下来介绍如何使用ES native module加载及使用lodash。假设有如下一段代码（在webpack下work）

	// main-bundled.js
	import _ from 'lodash'; 
	
	console.log('lodash version:', _.VERSION); // e.g. 4.17.4
	
	import map from 'lodash/map';
	
	console.log(
	  _.map([
	    { 'user': 'barney' },
	    { 'user': 'fred' }
	  ], 'user')
	); // ['barney', 'fred']


首先， `lodash` 自身并不能用 ES module 加载。其 CommonJS格式的源码如下：

	// lodash/map.js
	var arrayMap = require('./_arrayMap');
	//...
	module.exports = map;

即使 `lodash/lodash.js` 支持 AMD，CommonJS，及普通script引用，但并不支持 `<script type="module">` 格式引用


但lodash作者提供了包含ES module输出的 [lodash-es](https://github.com/lodash/lodash/tree/es) 类库，如源码：

	// lodash-es/map.js
	import arrayMap from './_arrayMap.js';
	//...
	export default map;

如此一来，我们就可以在自己的代码里以ES module的方式加载lodash了。项目目录如下

	project
	----dist_node_module
	--------lodash-es
	----node_module
	--------lodash
	----js
	--------main-bundled.js
	--------main-native.js
	----index.html
	----package.json
	----webpack.config.js

注意，我故意把 `lodash-es` 放置到 `dist_node_modules` 而非 `node_modules` 下。在大部分项目中，`node_modules` 没有配置Git，也不需要打包发布。而当在ES module时，文件并不是在build时被处理，而是在runtime时被加载

[项目代码](https://github.com/jiajianrong/malyw.github.io/tree/master/demos/native-ecmascript-modules-aliases)。 `js/main-bundled.js` 将会被webpack编译成 `dist/app.bundle.js`。但是 `js/main-native.js` 仍然是ES module格式，被浏览器依赖加载进来。

需要注意的是，js资源的URL路径都是相当于 `index.html`的地址，而且 `<base>` 对 `import`无效。

在浏览器中import module及依赖会发起GET请求资源，所以最好能启用 HTTPS/2



## 异步加载: import()

ES module默认是静态的：必须把import申明定义在module的顶部。尽管这有利于JS引擎优化，但开发者却不能实现异步加载。所以我们需要 `import()` 函数（返回Promise）


	import("./specifier.js"); // returns a Promise
	
	import('./a.js').then(()=>{
	  console.log('a.js is loaded dynamically');
	});
	
	import('./b.js').then((module)=>{
	  const b = module.default;
	  b();
	});
	
	import('./c.js').then(({c})=>{
	  c();
	});

	// load a script and use it on user actions
	FBshareBtn.on('click', ()=>{
	    import('/fb-sharing').then((FBshare)=>{
	        FBshare.do();
	    });
	});

	if(user.loggedIn){
	    import('user-widget.js');
	}


#### 既然 `import()` 返回Promise，我们大可以利用 `Promise.all`，`Promise.race` 等方法


	Promise.all([
	        import('./a.js'),
	        import('./b.js'),
	        import('./c.js'),
	    ])
	    .then(([a, {default: b}, {c}]) => {
	        console.log('a.js is loaded dynamically');
	        
	        b('isDynamic');
	        
	        c('isDynamic');
	    });


#### 还可以使用 `async/await`

	// STATIC
	import {test} from './utils_en.js'; // no dynamic locale
	test();

动态赋值locale
	
	// DYNAMIC
	(async () => {
	  const locale = 'en';
	  
	  const {test} = await import(`./utils_${locale}.js`);
	  test('isDynamic');
	})();


#### 异常处理

使用Promise一定要重点关照这个问题。如果是静态import，加载报错或运行报错都会自动扔出。但是使用Promise则需要或者提供第二个 `then()`，或者提供 `catch()`，否则就见不到错误信息了（被异步堆栈吞没）

	import (`./non-existing.js`)
	  .then(console.log)
	  .catch((err) => {
	    console.log(err.message); // "Importing a module script failed."
	    // apply some logic, e.g. show a feedback for the user
	  });

**如果Promise被rejected了并且没有被正确处理，浏览器和nodejs都不提供任何信息。** 所有最好设置全局异常处理监听，否则就会在浏览器console报错，或者nodejs进程以非0值退出

	window.addEventListener("unhandledrejection", (event)=> {
	  console.warn(`WARNING: Unhandled promise rejection. Reason: ${event.reason}`);
	  console.warn(event);
	});
	
	// process.on('unhandledRejection'... in case of Node.js


#### 支持

Babel提供了plugin [dynamic-import-webpack](https://github.com/airbnb/babel-plugin-dynamic-import-webpack)

[Webpack code splitting](https://webpack.js.org/guides/migrating/#code-splitting-with-es2015)也使用了 `import()`，进而替代 `require.ensure`
