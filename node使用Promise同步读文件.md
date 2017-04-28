# nodejs使用Promise同步读文件



上一篇文章[nodejs同步异步IO示范](https://github.com/jiajianrong/documents/blob/master/node%E5%90%8C%E6%AD%A5%E5%BC%82%E6%AD%A5IO%E7%A4%BA%E8%8C%83.md)最后一个例子是同步读文件，读完成一个再读取下一个。跟随原作者老爷爷的思路，我使用了Promise递归回调。其实根本不用这么复杂。接下来我们使用Promise.then()方法实现同步操作。


Promise.then的返回值若是一个promise的话，后续then里注册的回调方法(cb_next)会等待当前promise完成后执行，而且cb_next的形参也会改变为上一个promise的返回值。



## 使用Promise串行操作步骤

下面这个例子很简单，fn_1 fn_2 fn3 三个函数串行执行，fn_2的形参是fn_1的返回值，同理fn_3的形参是fn_2的返回值。

    var fs = require("fs");
	var Promise = require("promise");


	function fn_1(){
		var p = new Promise( function(resolve, reject) {
			setTimeout(function(){
				resolve('function 1 finished');
			}, 1000)
		} );
		return p;
	}


	function fn_2(pp){
		console.log(pp);
		var p = new Promise( function(resolve, reject) {
			setTimeout(function(){
				resolve('function 2 finished');
			}, 2000)
		} );
		return p;
	}


	function fn_3(pp){
		console.log(pp);
		var p = new Promise( function(resolve, reject) {
			setTimeout(function(){
				resolve('function 3 finished');
			}, 3000)
		} );
		return p;
	}


	fn_1().then(fn_2).then(fn_3).then(function(pp){console.log(pp)})





## 使用`sequence = Promise.resolve()`作为初始值，串行读文件

我们先看例子，利用for循环不断更新sequence。

    var fs = require("fs");
	var Promise = require("promise");


	function readDir(){
		var p = new Promise( function(resolve, reject) {
			fs.readdir( ".", function( err, files) { 
				if ( err ) {
					console.log("Error reading files: ", err);
				} else {
					resolve(files);
				}
			})
		} );
		return p;
	}



	function readFile(file){
		var p = new Promise( function(resolve, reject) {
			fs.readFile( file, function( err, data) { 
				if ( err ) {
					console.log("Error reading files: ", err);
				} else {
					console.log("Successfully read a file.", file);
					totalBytes += data.length;
					console.log(totalBytes);
					resolve(data);
				}
			})
		} );
		return p;
	}



	var sequence = Promise.resolve();
	var totalBytes = 0;



	readDir().then(function(files){
		files.forEach(function(file){
			sequence = sequence.then(function(){
				return readFile(file)
			})
		})
		
		return sequence;
	}).then(function(){console.log('final: ',totalBytes);})



Promise.resolve()创建一个promise，它将会被resolve。

- 如果你传入一个promise，它会简单返回该Promise
- 如果你传入一个promise-like的对象(例如含有then方法)，它会创建promise
- 如果你传入一个具体值，如`Promise.resolve('hello')`，它会创建一个promise并使用该值fulfill
- 如果你什么也不传入，像上面例子一样，它会使用'undefined'来fulfill

其实思路很简单：在for循环里不断为sequence增加then()，并且当前sequence指向then之后的sequence。不过上面代码的不足之处在于创建了两个全局变量sequence和totalBytes，并且在readFile方法里不断累加totalBytes。接下来我们优化代码，移除全局变量。



## 使用Array.reduce分解数组

Array.reduce是一个冷门用法，可以参见张大神的[es5新增数组方法](http://www.zhangxinxu.com/wordpress/2013/04/es5%E6%96%B0%E5%A2%9E%E6%95%B0%E7%BB%84%E6%96%B9%E6%B3%95/#reduce)。大神的举例来自官方示例，其实并不能真正说明reduce的威力。接下来我会稍微详解一点。

在上面的代码里有一行 `sequence = sequence.then(function(){` 用来不断更新sequence，用途是不断的then下一个操作。这个写法可以被Array.reduce取代，因为reduce的第一个形参函数的第一个参数就是其本身上一次执行的返回值。我们只需在reduce回调函数里返回sequence本身，就可以达到前面的效果。

Array.reduce第二个形参设置为sequence，可以免去定义全局变量。

在sequence.then后面再接一个then，用来累计文件长度，达到净化readFile函数的效果。这样也符合函数式编程的思路：一个函数只做一件事；额外的事情交给下一个函数。

至于移除全局变量totalBytes，我们可以把它换成函数的静态属性(jQuery经常这么干)

最后优化后的代码如下，除了三个回调函数再无全局变量。

    var fs = require("fs");
	var Promise = require("promise");


	function readDir(){
		var p = new Promise( function(resolve, reject) {
			fs.readdir( ".", function( err, files) { 
				if ( err ) {
					console.log("Error reading files: ", err);
				} else {
					resolve(files);
				}
			})
		} );
		return p;
	}



	function readFile(file){
		var p = new Promise( function(resolve, reject) {
			fs.readFile( file, function( err, data) { 
				if ( err ) {
					console.log("Error reading files: ", err);
				} else {
					console.log("Successfully read a file.", file);
					resolve(data);
				}
			})
		} );
		return p;
	}




	function sum(data){
		var p = new Promise( function(resolve, reject) {
			sum.totalBytes = sum.totalBytes ? sum.totalBytes+data.length : data.length;
			resolve(sum.totalBytes);
		} );
		return p;
	}




	readDir().then(function(files){
		return files.reduce(function(sequence, file){
			return sequence.then(function(){
				return readFile(file)
			}).then(sum)
		}, Promise.resolve());
	}).then(function(){console.log('final: ',sum.totalBytes);})





*[译自google_dev](https://developers.google.com/web/fundamentals/getting-started/primers/promises)
转载请注明来自58金融前端团队*