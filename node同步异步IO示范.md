# nodejs同步异步IO示范

JavaScript并没有设计好异步操作。如果设计得当，编写异步代码应该和编写阻塞代码一样容易（注：此文较早，当时还没有ES6、7的async await，也难怪这位老爷爷抱怨）。结果导致开发人员不得不处理各种callback。

我们用四种不同的异步操作，来实现相同的功能 - 在当前目录下读取所有文件。

1. 使用callback并行读
1. 使用callback串行读
1. 使用promise并行读
1. 使用promise串行读

这将会帮你决定什么时候该用哪种操作。如果你想知道哪一个是最好的 -- 绝对是 -- 改用go语言。（注：作者偏激了，译者10年前做Java多线程操作的时候，底层用Runnable+HashTable封装的难易程度和实现一个Promise差不多，本质都是队列、回调。哦，Java还多一个同步）

## 使用callbacks并行读文件

我们的任务是读取当前目录的所有文件。

我们需要先知道当前目录都有哪些文件，然后才能读取他们。所以先用readdir()，等到所有操作都结束了，然后对于每个文件使用readFile()读取内容。

所有的readFile()操作都立即被执行了，然后我们等待读取结果。我们计算有多少个readFile()完成了。当所有的都完成了，程序就结束了。

    // Read all files in the folder in parallel.
    var fs = require("fs");

    fs.readdir( ".", function( err, files) {
        if ( err ) {
            console.log("Error reading files: ", err);
        } else {
            // keep track of how many we have to go.
            var remaining = files.length;
            var totalBytes = 0;

            if ( remaining == 0 ) {
                console.log("Done reading files. totalBytes: " +
                    totalBytes);
            }

            // for each file,
            for ( var i = 0; i < files.length; i++ ) {
                // read its contents.
                fs.readFile( files[i], function( error, data ) {
                    if ( error ) {
                        console.log("Error: ", error);
                    } else {
                        totalBytes += data.length
                        console.log("Successfully read a file.");
                    }
                    remaining -= 1;
                    if ( remaining == 0 ) {
                        console.log("Done reading files. totalBytes: " +
                            totalBytes);
                    }
                });
            }
        }
    });



## 使用callbacks窜行读文件

并行读取一般来说是效率最高的。让计算机一次性开始所有任务，然后等待OS自动安排。但某些场合，你也需要自定义顺序，串行的去干活。

下面的例子一次读一个文件。用递归取代for循环。递归函数自我检测是否已经读完所有文件。没有的话则调用自身，读取下一个文件。

    // Read all the files in the folder in sequence, using callbacks
    var fs = require("fs");

    fs.readdir( ".", function( error, files ) {
        if ( error ) {
            console.log("Error listing file contents.");
        } else {
            var totalBytes = 0;

            // This function repeatedly calls itself until the files are all read.
            var readFiles = function(index) {
                if ( index == files.length ) {
                    // we are done.
                    console.log( "Done reading files. totalBytes = " + 
                        totalBytes );
                } else {

                    fs.readFile( files[index], function( error, data ) {
                        if ( error ) {
                            console.log( "Error reading file. ", error );
                        } else {
                            totalBytes += data.length;
                            readFiles(index + 1);
                        }
                    });
                }

            };

            readFiles(0);
        }
    });


## 使用promise并行读文件

Promise(另一个名称是future)，是一个1970年代就有的概念，最近在JavaScript里流行起来。Promise在nodejs需要安装[promise](https://github.com/kriszyp/node-promise)。nodejs默认没有安装这个模块，需要手动安装。

当你调用一个function，期待返回一个value，但是value本身还没有生成，function就返回一个promise。调用者就可以保存这个function以便以后使用，或者当promise完成后，发起下一个操作。nodejs里的EventEmitter就是一个特殊的promise，他仅有两种事件：reject和resolve。我们使用then函数而非on来监听event。

一个小例子

    var promise = doSomeAsynchronousOperation();
	promise.then( function(result) {
    	// yay! I got the result.
	}, function(error) {
    	// The promise was rejected with this error.
	}
	
	function doSomeAsynchronousOperation()
	{
   		var promise = new Promise.Promise();
   		fs.readFile( "somefile.txt", function( error, data ) {
        	if ( error ) {
        	    promise.reject( error );
       		} else {
            	promise.resolve( data );
        	}
    	});
	
    	return promise;
	}

Promise非常好用，因为它只返回一个值。另一个好处是它可以封装循环调用。很轻松就可以为一组promise构建一个super-promise。当promise数组里所有成员都resolve了，super-promise才会resolve：Promise.all()

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


	readDir().then(function(files){
		var promises = [];
		for ( var i = 0; i < files.length; i++ ) {
			promises.push( readFile(files[i]) );
		}
		
		Promise.all( promises ).then( function(results) {
			var totalBytes = 0;
			for ( i = 0; i < results.length; i++ ) {
				totalBytes += results[i].length;
			}
			console.log("Done reading files. totalBytes = " + totalBytes);
		}, function( error ) {
			console.log("Error reading files");
		});
	});



## 使用promise串行读文件

Promise默认很难处理串行操作。不过我们可以使用一些类库，如[PromiseSequence](https://github.com/smhanov/node-promise-sequence)定义了一组串行执行的操作步骤。

所以代码不再需要很多回调，我们可以按串行的格式写串行操作(注：和callback形式的串行做对比，下面的代码优雅很多)。

(注：作者老爷爷引用的PromiseSequence类库实在太旧了，无法兼容目前的node版本。译者改成了简单的Promise.then递归)

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



	readDir().then(function(files){
		
		var idx = 0;
		var totalBytes = 0;
		
		function read(file) {
		
			if (idx>=files.length) {
				console.log( "Done reading files. totalBytes = " + totalBytes );
				return;
			}
			
			readFile(file).then(function(results){
				totalBytes += results.length;
				read(files[++idx]);
			});
		}
		
		read(files[idx]);
		
	})


## 为什么我脑子疼？
我写了40年的代码。我使用过很多语言，只有JavaScript让我头疼，特别是是实现这么简单的功能。如果你有很多的异步操作，有选择的话还是考虑其他语言吧。(LOL)



*[译自](http://stevehanov.ca/blog/index.php?id=127)
转载请注明来自58金融前端团队*